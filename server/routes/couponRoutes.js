const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/coupons/apply
 * @desc    Validate and apply coupon code (Module 9)
 * @access  Public / Authenticated
 */
router.post('/apply', async (req, res, next) => {
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

    return res.status(200).json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
