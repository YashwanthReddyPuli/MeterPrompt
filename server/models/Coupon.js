const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    validTill: {
      type: Date,
      required: true
    },
    maxRedemptions: {
      type: Number,
      default: null
    },
    timesRedeemed: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model('Coupon', couponSchema);
