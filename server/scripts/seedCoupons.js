const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Coupon = require('../models/Coupon');

const seedCoupons = async () => {
  try {
    await connectDB();

    const defaultCoupon = {
      code: 'BUILDWITHAI20',
      discountPercent: 20,
      validTill: new Date('2026-12-31T23:59:59.999Z'),
      isActive: true
    };

    const existing = await Coupon.findOne({ code: defaultCoupon.code });

    if (!existing) {
      await Coupon.create(defaultCoupon);
      console.log(`[Seed] Coupon '${defaultCoupon.code}' (20% off) created successfully.`);
    } else {
      console.log(`[Seed] Coupon '${defaultCoupon.code}' already exists.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed coupons:', error);
    process.exit(1);
  }
};

seedCoupons();
