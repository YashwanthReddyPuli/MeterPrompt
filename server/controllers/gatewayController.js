const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const { hashApiKey } = require('../utils/apiKey');

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
      const jwt = require('jsonwebtoken');
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_meterprompt_2026');
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

    const { model, messages } = req.body;
    const promptText = (messages && Array.isArray(messages)) 
      ? messages.map(m => m.content).join(' ') 
      : (req.body.prompt || 'Hello MeterPrompt');

    // Calculate prompt and completion tokens
    const promptTokens = Math.max(5, Math.ceil(promptText.length / 4));
    const completionText = `[MeterPrompt Mock LLM Response] Analysis complete for your query "${promptText.substring(0, 40)}...". Generated with enterprise gateway rate limits enforced.`;
    const completionTokens = Math.max(10, Math.ceil(completionText.length / 4));
    const totalTokens = promptTokens + completionTokens;

    // Simulated latency & deterministic response
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
