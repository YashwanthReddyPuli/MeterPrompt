const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const { protect, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/admin/reports/revenue
 * @desc    Module 12: Admin MRR & Churn Analytics Report
 * @access  Private (Admin)
 */
router.get('/reports/revenue', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const activeSubscriptions = await Subscription.find({
      status: { $in: ['active', 'grace_period'] }
    }).populate('planId');

    let mrr = 0;
    const tierBreakdown = {
      Starter: 0,
      Pro: 0,
      Max: 0
    };

    for (const sub of activeSubscriptions) {
      if (sub.planId) {
        const tierName = sub.planId.name || 'Starter';
        const rawPrice = sub.planId.priceUSD || sub.planId.price || 0;
        const billingCycle = sub.planId.billingCycle || 'monthly';

        if (tierBreakdown[tierName] !== undefined) {
          tierBreakdown[tierName] += 1;
        } else {
          tierBreakdown[tierName] = 1;
        }

        if (billingCycle === 'yearly' || billingCycle === 'annual') {
          mrr += rawPrice / 12;
        } else {
          mrr += rawPrice;
        }
      }
    }

    const totalSubscriptionsCount = await Subscription.countDocuments();
    const canceledSubscriptionsCount = await Subscription.countDocuments({
      $or: [{ status: 'canceled' }, { cancelAtPeriodEnd: true }]
    });

    const churnRate = totalSubscriptionsCount > 0
      ? Number(((canceledSubscriptionsCount / totalSubscriptionsCount) * 100).toFixed(2))
      : 0;

    return res.status(200).json({
      success: true,
      mrr: Number(mrr.toFixed(2)),
      activeSubscribers: activeSubscriptions.length,
      churnRate: churnRate,
      tierBreakdown: tierBreakdown,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
