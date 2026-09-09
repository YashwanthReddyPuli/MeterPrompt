const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, requireRole } = require('../middleware/auth');
const { dispatchBillingEvent } = require('../utils/eventBus');
const {
  getAllCoupons,
  createCoupon,
  toggleCouponStatus
} = require('../controllers/couponController');

/**
 * @route   POST /api/coupons/apply
 * @desc    Validate and apply coupon code (Module 9)
 * @access  Public / Authenticated
 */
router.post('/apply', protect, async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required.',
        errorCode: 'INVALID_COUPON'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code does not exist or is inactive.',
        errorCode: 'INVALID_COUPON'
      });
    }

    if (new Date(coupon.validTill) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code has expired.',
        errorCode: 'INVALID_COUPON'
      });
    }

    if (coupon.maxRedemptions && coupon.timesRedeemed >= coupon.maxRedemptions) {
      return res.status(400).json({
        success: false,
        message: 'Coupon redemption limit has been reached.',
        errorCode: 'INVALID_COUPON'
      });
    }

    // Increment redemption count
    coupon.timesRedeemed = (coupon.timesRedeemed || 0) + 1;
    await coupon.save();

    if (req.user) {
      const userName = req.user.name || req.user.email || 'Customer';
      await dispatchBillingEvent({
        type: 'customer.discount.applied',
        customerId: req.user._id,
        summary: `${userName} applied coupon ${coupon.code} (${coupon.discountPercent}% OFF)`,
        object: {
          code: coupon.code,
          discountPercent: coupon.discountPercent
        },
        req
      });
    }

    return res.status(200).json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent
    });
  } catch (error) {
    next(error);
  }
});

// Admin Coupon Management Routes (Module 9 Extension)
router.get('/admin/coupons', protect, requireRole('admin'), getAllCoupons);
router.post('/admin/coupons', protect, requireRole('admin'), createCoupon);
router.patch('/admin/coupons/:id/toggle', protect, requireRole('admin'), toggleCouponStatus);

module.exports = router;


