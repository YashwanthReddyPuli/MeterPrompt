const Coupon = require('../models/Coupon');

/**
 * @route   GET /api/admin/coupons
 * @desc    Get all promotional coupons
 * @access  Private (Admin)
 */
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/coupons
 * @desc    Mint a new promotional coupon
 * @access  Private (Admin)
 */
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercent, validTill, maxRedemptions } = req.body;

    if (!code || !discountPercent || !validTill) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount percentage, and expiration date are required.',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Coupon code '${cleanCode}' already exists.`,
        errorCode: 'COUPON_ALREADY_EXISTS'
      });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountPercent: Number(discountPercent),
      validTill: new Date(validTill),
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      timesRedeemed: 0,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Coupon minted successfully.',
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/coupons/:id/toggle
 * @desc    Toggle coupon active status
 * @access  Private (Admin)
 */
const toggleCouponStatus = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCoupons,
  createCoupon,
  toggleCouponStatus
};
