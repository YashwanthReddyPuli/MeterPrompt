const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const UsageRecord = require('../models/UsageRecord');
const { hashApiKey } = require('../utils/apiKey');

// Ensure JWT_SECRET environment variable is configured at startup
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: process.env.JWT_SECRET is missing. Silently falling back to a baked-in secret is prohibited.');
}

const PER_TOKEN_OVERAGE_RATE_USD = 0.000002; // $0.000002 per token

/**
 * @route   POST /api/v1/chat/completions
 * @desc    AI API Proxy Gateway completion endpoint (Mock / Forwarding)
 * @access  Public (Protected via API Key in header 'x-api-key' or Authorization header)
 */
const handleChatCompletion = async (req, res, next) => {
  try {
    const rawApiKey = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.startsWith('Bearer mp_live_') ? req.headers.authorization.split(' ')[1] : null);
    
    let user;
    if (rawApiKey) {
      const keyHash = hashApiKey(rawApiKey);
      user = await User.findOne({ 'apiKeys.keyHash': keyHash });
    } else if (req.user) {
      user = req.user;
    }

    if (!user && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Fallback for JWT bearer in gateway test console
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (e) {
        // Invalid JWT
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing API key. Please pass a valid API key in header "x-api-key: mp_live_..."',
        errorCode: 'INVALID_API_KEY'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended/inactive. API access has been temporarily disabled.',
        errorCode: 'ACCOUNT_SUSPENDED'
      });
    }

    const { model, messages } = req.body;
    const promptText = (messages && Array.isArray(messages)) 
      ? messages.map(m => m.content).join(' ') 
      : (req.body.prompt || 'Hello MeterPrompt');

    // Calculate estimated prompt and completion tokens
    const promptTokens = Math.max(5, Math.ceil(promptText.length / 4));
    const completionText = `[MeterPrompt Mock LLM Response] Analysis complete for your query "${promptText.substring(0, 40)}...". Generated with enterprise gateway rate limits enforced.`;
    const completionTokens = Math.max(10, Math.ceil(completionText.length / 4));
    const totalTokens = promptTokens + completionTokens;

    // BUSINESS RULE: Fetch active subscription and enforce monthly plan token quotas before processing request
    const activeSub = await Subscription.findOne({
      customerId: user._id,
      status: { $in: ['active', 'grace_period'] }
    }).populate('planId');

    let isOverageRequest = false;
    let overageTokens = 0;

    if (activeSub && activeSub.planId) {
      const plan = activeSub.planId;
      const maxMonthlyTokens = plan.featureLimits?.maxTokensPerMonth || 100000;

      // Sum all tokens consumed by this subscription within current billing cycle
      const periodUsageAggregate = await UsageRecord.aggregate([
        {
          $match: {
            subscriptionId: activeSub._id,
            createdAt: {
              $gte: activeSub.currentPeriodStart,
              $lte: activeSub.currentPeriodEnd
            }
          }
        },
        {
          $group: {
            _id: null,
            totalPeriodTokens: { $sum: '$totalTokens' }
          }
        }
      ]);

      const currentPeriodUsage = periodUsageAggregate.length > 0 ? periodUsageAggregate[0].totalPeriodTokens : 0;

      // Quota check: Block request if total tokens exceed allowed plan quota
      if (currentPeriodUsage + totalTokens > maxMonthlyTokens) {
        return res.status(429).json({
          success: false,
          message: `Monthly token quota exhausted (${currentPeriodUsage.toLocaleString()} / ${maxMonthlyTokens.toLocaleString()} tokens used). Please upgrade your plan tier or top up your balance.`,
          errorCode: 'QUOTA_EXHAUSTED'
        });
      }

      // Check if this request goes beyond included quota for overage billing
      if (currentPeriodUsage >= maxMonthlyTokens) {
        isOverageRequest = true;
        overageTokens = totalTokens;
      } else if (currentPeriodUsage + totalTokens > maxMonthlyTokens) {
        isOverageRequest = true;
        overageTokens = (currentPeriodUsage + totalTokens) - maxMonthlyTokens;
      }
    }

    // Write UsageRecord for telemetry and audit tracking
    const costUSD = isOverageRequest ? (overageTokens * PER_TOKEN_OVERAGE_RATE_USD) : 0;
    
    if (activeSub) {
      await UsageRecord.create({
        subscriptionId: activeSub._id,
        customerId: user._id,
        promptTokens,
        completionTokens,
        totalTokens,
        model: model || 'mock-llm-v1',
        costUSD,
        createdAt: new Date()
      });
    }

    // Decrement creditsBalance if overage charges apply
    if (isOverageRequest && costUSD > 0) {
      user.creditsBalance = Math.max(0, (user.creditsBalance || 0) - costUSD);
      await user.save();
    }

    // Simulated latency & deterministic response payload (Unchanged structure)
    const responsePayload = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'mock-llm-v1',
      providerMode: process.env.AI_PROXY_MODE || 'mock',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: completionText
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens
      },
      metering: {
        meteredAt: new Date().toISOString(),
        userEmail: user.email,
        apiKeyPrefix: user.apiKeys && user.apiKeys[0] ? user.apiKeys[0].prefix : 'mp_live_demo'
      }
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

module.exports = { handleChatCompletion };

