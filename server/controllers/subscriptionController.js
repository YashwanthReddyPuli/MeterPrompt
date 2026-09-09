const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Invoice = require('../models/Invoice');
const { calculateProration } = require('../utils/proration');

/**
 * @route   POST /api/subscriptions
 * @desc    Customer subscribes to a plan (Module 3)
 * @access  Private (Customer)
 */
const createSubscription = async (req, res, next) => {
  try {
    const { planId, currency } = req.body;
    const customerId = req.user._id;

    let plan = null;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      plan = await Plan.findById(planId);
    }
    
    if (!plan) {
      plan = await Plan.findOne({ isActive: true });
    }

    if (!plan) {
      // Fallback auto-creation if database has no plan documents
      plan = await Plan.create({
        name: 'Starter Plan',
        description: 'Default Starter Tier',
        priceUSD: 19.99,
        priceINR: 1499,
        billingCycle: 'monthly',
        isActive: true,
        featureLimits: {
          maxRequestsPerMinute: 60,
          maxTokensPerMonth: 100000,
          allowedModels: ['gpt-4o', 'gpt-4o-mini'],
          overageRatePer1kTokensUSD: 0.002
        }
      });
    }

    // Check if customer already has an active subscription
    const existingSub = await Subscription.findOne({
      customerId,
      status: { $in: ['active', 'past_due', 'grace_period'] }
    });

    if (existingSub) {
      return res.status(409).json({
        success: false,
        message: 'Customer already has an active subscription. Use upgrade/downgrade endpoint to switch plans.',
        errorCode: 'ACTIVE_SUBSCRIPTION_EXISTS'
      });
    }

    const now = new Date();
    const periodDays = plan.billingCycle === 'yearly' ? 365 : 30;
    const currentPeriodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.create({
      customerId,
      planId: plan._id,
      status: 'active',
      currency: currency || 'USD',
      currentPeriodStart: now,
      currentPeriodEnd,
      prorationBalanceUSD: 0,
      prorationBalanceINR: 0,
      auditTrail: [{
        action: 'CREATED',
        newPlanId: plan._id,
        note: `Initial subscription to plan '${plan.name}' (${plan.billingCycle}).`
      }]
    });

    const populatedSub = await Subscription.findById(subscription._id).populate('planId');

    const invoiceNumber = `SUB-${Date.now().toString().slice(-6)}`;
    const invoice = await Invoice.create({
      customerId,
      invoiceNumber,
      amount: plan.priceUSD || 19.99,
      currency: currency || 'USD',
      type: 'subscription',
      description: `Subscription to ${plan.name} Plan`,
      status: 'Paid',
      date: now
    });

    return res.status(201).json({
      success: true,
      message: `Successfully subscribed to plan '${plan.name}'.`,
      invoice,
      data: populatedSub
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/subscriptions/me
 * @desc    Get current user's active subscription
 * @access  Private
 */
const getCurrentSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      customerId: req.user._id,
      status: { $ne: 'canceled' }
    }).populate('planId');

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active subscription found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/subscriptions/:id/change-plan
 * @desc    Mid-cycle plan upgrade or downgrade with proration (Module 4)
 * @access  Private (Customer / Admin)
 */
const changePlan = async (req, res, next) => {
  try {
    const { newPlanId } = req.body;
    const subscriptionId = req.params.id;

    const subscription = await Subscription.findById(subscriptionId).populate('planId');
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    // Verify ownership or admin access
    if (subscription.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this subscription.',
        errorCode: 'AUTHORIZATION_ERROR'
      });
    }

    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan || !newPlan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Target subscription plan not found or inactive.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    const currentPlanId = subscription.planId?._id || subscription.planId;
    if (currentPlanId && currentPlanId.toString() === newPlan._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already on this plan.',
        errorCode: 'SAME_PLAN_ERROR'
      });
    }

    // Perform proration calculation
    const oldPlan = subscription.planId || newPlan;
    const proration = calculateProration({
      oldPlan,
      newPlan,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      now: new Date()
    });

    const oldPlanId = currentPlanId;
    subscription.planId = newPlan._id;
    subscription.prorationBalanceUSD += proration.prorationBalanceUSD;
    subscription.prorationBalanceINR += proration.prorationBalanceINR;

    subscription.auditTrail.push({
      action: proration.action,
      oldPlanId,
      newPlanId: newPlan._id,
      prorationBalanceUSD: proration.prorationBalanceUSD,
      prorationBalanceINR: proration.prorationBalanceINR,
      note: proration.auditNote,
      timestamp: new Date()
    });

    const invoiceNumber = `SUB-${Date.now().toString().slice(-6)}`;
    const invoice = await Invoice.create({
      customerId: subscription.customerId,
      invoiceNumber,
      amount: newPlan.priceUSD || 19.99,
      currency: subscription.currency || 'USD',
      type: proration.action === 'UPGRADE' ? 'subscription' : 'proration',
      description: `Plan switch to ${newPlan.name} (${proration.action})`,
      status: 'Paid',
      date: new Date()
    });

    await subscription.save();
    const updatedSub = await Subscription.findById(subscription._id).populate('planId');

    return res.status(200).json({
      success: true,
      message: `Plan successfully updated to '${newPlan.name}'.`,
      prorationSummary: proration,
      invoice,
      data: updatedSub
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/subscriptions/:id/cancel
 * @desc    Cancel subscription at period end (Module 8 prep)
 * @access  Private (Customer / Admin)
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    if (subscription.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this subscription.',
        errorCode: 'AUTHORIZATION_ERROR'
      });
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.canceledAt = new Date();
    // Maintain status as 'active' or 'grace_period' until currentPeriodEnd passes
    if (subscription.status !== 'canceled') {
      subscription.status = 'active';
    }

    subscription.auditTrail.push({
      action: 'CANCELED',
      note: `Subscription set to cancel at end of current period (${subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toISOString() : 'period end'}).`,
      timestamp: new Date()
    });

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription scheduled for cancellation at period end.',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createSubscription,
  getCurrentSubscription,
  changePlan,
  cancelSubscription
};
