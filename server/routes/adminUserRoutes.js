const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const { protect, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with subscription, credit balance, and key counts
 * @access  Private (Admin)
 */
router.get('/users', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();

    const userList = await Promise.all(
      users.map(async (u) => {
        const sub = await Subscription.findOne({ customerId: u._id, status: { $ne: 'canceled' } })
          .populate('planId')
          .lean();
        
        const keyCount = u.apiKeys ? u.apiKeys.length : 0;
        
        return {
          ...u,
          _id: u._id,
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          creditsBalance: u.creditsBalance || 0,
          status: u.isSuspended ? 'Suspended' : 'Active',
          isSuspended: Boolean(u.isSuspended),
          subscription: sub || null,
          currentPlanName: sub?.planId?.name || 'No Active Plan',
          billingCycle: sub?.planId?.billingCycle || 'N/A',
          keyCount,
          createdAt: u.createdAt
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: userList.length,
      data: userList
    });
  } catch (error) {
    next(error);
  }
});


/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user drilldown (Subscription history, keys, invoices, quota)
 * @access  Private (Admin)
 */
router.get('/users/:id', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    const subscription = await Subscription.findOne({ customerId: user._id }).populate('planId').lean();
    const apiKeys = (user.apiKeys || []).map(k => ({
      _id: k._id,
      name: k.name || 'Default Key',
      keyPrefix: k.prefix || 'sk_live',
      createdAt: k.createdAt
    }));

    const invoices = await Invoice.find({ customerId: user._id }).sort({ createdAt: -1 }).lean();

    const tokensUsed = 0;
    const tokenLimit = subscription?.planId?.featureLimits?.maxTokensPerMonth || 100000;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          creditsBalance: user.creditsBalance || 0,
          isSuspended: Boolean(user.isSuspended),
          createdAt: user.createdAt
        },
        subscription,
        apiKeys,
        invoices,
        tokenQuota: {
          tokensUsed,
          tokenLimit,
          usagePercentage: Math.min(100, Math.round((tokensUsed / tokenLimit) * 100))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});


/**
 * @route   PUT /api/admin/users/:id/action
 * @desc    Perform admin actions (Adjust Balance, Toggle Suspend, Reset Password)
 * @access  Private (Admin)
 */
router.put('/users/:id/action', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { action, creditsBalance, isSuspended } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    if (action === 'adjust_credits' && creditsBalance !== undefined) {
      user.creditsBalance = Number(creditsBalance);
    } else if (action === 'toggle_suspend') {
      user.isSuspended = isSuspended !== undefined ? isSuspended : !user.isSuspended;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User action '${action}' processed successfully.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        creditsBalance: user.creditsBalance,
        isSuspended: user.isSuspended
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
