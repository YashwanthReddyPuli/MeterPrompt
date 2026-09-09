const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Invoice = require('../models/Invoice');
const { calculateProration } = require('../utils/proration');

const { dispatchBillingEvent } = require('../utils/eventBus');

/**
 * @route   POST /api/subscriptions
 * @desc    Customer subscribes to a plan (Module 3)
 * @access  Private (Customer)
 */
// Helper to calculate total cycle price for a plan
const getCyclePrice = (plan, cycle) => {
  const targetCycle = cycle || plan.billingCycle || 'monthly';
  const isAnnual = targetCycle === 'annual' || targetCycle === 'yearly';
  const basePrice = plan.priceUSD !== undefined ? plan.priceUSD : (plan.price || 19.99);

  if (isAnnual) {
    // 20% discount annualized: monthly * 0.8 * 12
    return Number(((basePrice * 0.8) * 12).toFixed(2));
  }
  return Number(basePrice.toFixed(2));
};

/**
 * @route   POST /api/subscriptions
 * @desc    Customer subscribes to a plan (Module 3)
 * @access  Private (Customer)
 */
const createSubscription = async (req, res, next) => {
  try {
    const { planId, currency, billingCycle: reqCycle } = req.body;
    const customerId = req.user._id;

    let plan = null;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      plan = await Plan.findById(planId);
    }
    
    if (!plan) {
      plan = await Plan.findOne({ isActive: true });
    }

    if (!plan) {
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

    const targetCycle = reqCycle || plan.billingCycle || 'monthly';
    const fullPlanAmount = getCyclePrice(plan, targetCycle);

    const now = new Date();
    const currentPeriodEnd = new Date(now);
    if (targetCycle === 'annual' || targetCycle === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

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
        note: `Initial subscription to plan '${plan.name}' (${targetCycle}).`
      }]
    });

    const populatedSub = await Subscription.findById(subscription._id).populate('planId');

    const cycleLabel = targetCycle === 'annual' || targetCycle === 'yearly' ? 'Annual' : 'Monthly';
    const invoiceDescription = `Initial Subscription: ${plan.name} (${cycleLabel})`;
    const invoiceNumber = `SUB-${Date.now().toString().slice(-6)}`;

    const invoice = await Invoice.create({
      customerId,
      invoiceNumber,
      amount: fullPlanAmount,
      currency: currency || 'USD',
      type: 'subscription',
      description: invoiceDescription,
      status: 'Paid',
      date: now
    });

    const userName = req.user.name || req.user.email || 'Customer';

    // Dispatch Billing Event
    await dispatchBillingEvent({
      type: 'customer.subscription.created',
      customerId: req.user._id,
      summary: `${userName} subscribed to ${plan.name} (${cycleLabel}) for $${fullPlanAmount.toFixed(2)}`,
      object: {
        id: subscription._id,
        plan: plan.name,
        billingCycle: targetCycle,
        status: 'active',
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      req
    });

    await dispatchBillingEvent({
      type: 'invoice.payment_succeeded',
      customerId: req.user._id,
      summary: `Payment of $${invoice.amount.toFixed(2)} processed for ${invoiceDescription}`,
      object: {
        invoiceId: invoice.invoiceNumber,
        amount: invoice.amount,
        status: 'paid',
        type: 'subscription'
      },
      req
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
    const { newPlanId, billingCycle: reqCycle } = req.body;
    const subscriptionId = req.params.id;

    const subscription = await Subscription.findById(subscriptionId).populate('planId');
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

    const targetCycle = reqCycle || newPlan.billingCycle || 'monthly';
    const oldCycle = subscription.planId?.billingCycle || 'monthly';
    const oldPlan = subscription.planId || newPlan;
    const oldPlanName = oldPlan.name || 'Previous Plan';

    const oldCyclePrice = getCyclePrice(oldPlan, oldCycle);
    const newCyclePrice = getCyclePrice(newPlan, targetCycle);

    // Calculate Proration Credit from previous subscription if mid-cycle
    let prorationCredit = 0;
    const now = new Date();
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > now && subscription.currentPeriodStart) {
      const totalDuration = subscription.currentPeriodEnd.getTime() - subscription.currentPeriodStart.getTime();
      const remainingTime = Math.max(0, subscription.currentPeriodEnd.getTime() - now.getTime());
      if (totalDuration > 0) {
        const fractionRemaining = remainingTime / totalDuration;
        prorationCredit = Number((oldCyclePrice * fractionRemaining).toFixed(2));
      }
    }

    const netAmountCharged = Math.max(0, Number((newCyclePrice - prorationCredit).toFixed(2)));

    // Calculate new currentPeriodEnd
    const newPeriodEnd = new Date(now);
    if (targetCycle === 'annual' || targetCycle === 'yearly') {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
    } else {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
    }

    const cycleLabel = targetCycle === 'annual' || targetCycle === 'yearly' ? 'Annual' : 'Monthly';
    let invoiceDescription = "";
    let actionType = "UPGRADE";

    if (oldPlan.name === newPlan.name && oldCycle !== targetCycle) {
      invoiceDescription = `Tenure Change: ${newPlan.name} switched to ${cycleLabel}`;
      actionType = "TENURE_CHANGE";
    } else {
      actionType = newCyclePrice >= oldCyclePrice ? 'Upgrade' : 'Downgrade';
      invoiceDescription = `Plan ${actionType}: ${oldPlanName} → ${newPlan.name} (${cycleLabel})`;
    }

    const oldPlanId = oldPlan._id;
    subscription.planId = newPlan._id;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = newPeriodEnd;
    subscription.prorationBalanceUSD += Number((newCyclePrice - prorationCredit).toFixed(2));

    subscription.auditTrail.push({
      action: actionType.toUpperCase().includes('DOWNGRADE') ? 'DOWNGRADE' : 'UPGRADE',
      oldPlanId,
      newPlanId: newPlan._id,
      prorationBalanceUSD: Number((newCyclePrice - prorationCredit).toFixed(2)),
      note: `Mid-cycle switch to ${newPlan.name} (${cycleLabel}). Net charged: $${netAmountCharged.toFixed(2)} (Proration credit: $${prorationCredit.toFixed(2)}).`,
      timestamp: now
    });

    const invoiceNumber = `SUB-${Date.now().toString().slice(-6)}`;
    const invoice = await Invoice.create({
      customerId: subscription.customerId,
      invoiceNumber,
      amount: netAmountCharged,
      currency: subscription.currency || 'USD',
      type: actionType.toUpperCase().includes('DOWNGRADE') ? 'proration' : 'subscription',
      description: invoiceDescription,
      status: 'Paid',
      date: now
    });

    await subscription.save();
    const updatedSub = await Subscription.findById(subscription._id).populate('planId');

    const userName = req.user.name || req.user.email || 'Customer';

    // Dispatch Billing Event
    await dispatchBillingEvent({
      type: 'customer.subscription.updated',
      customerId: req.user._id,
      summary: `${userName} updated to ${newPlan.name} (${cycleLabel}) for $${netAmountCharged.toFixed(2)}`,
      object: {
        id: subscription._id,
        plan: newPlan.name,
        billingCycle: targetCycle,
        status: 'active',
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      previousAttributes: {
        plan: oldPlanName,
        billingCycle: oldCycle
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Plan successfully updated to '${newPlan.name}'.`,
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
    const subscription = await Subscription.findById(req.params.id).populate('planId');
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

    const userName = req.user.name || req.user.email || 'Customer';
    const planName = subscription.planId?.name || 'Current Plan';

    // Dispatch Billing Event
    await dispatchBillingEvent({
      type: 'customer.subscription.cancel_scheduled',
      customerId: req.user._id,
      summary: `${userName} scheduled cancellation for ${planName} at period end`,
      object: {
        id: subscription._id,
        plan: planName,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      req
    });

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
