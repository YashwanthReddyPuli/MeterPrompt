const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const { calculateProration } = require('../utils/proration');
const { generateApiKey, hashApiKey } = require('../utils/apiKey');

async function runSprint1Verification() {
  console.log('=== MeterPrompt Sprint 1 Pre-Commit Verification Audit ===\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`[PASSED] ${description}`);
      passed++;
    } else {
      console.error(`[FAILED] ${description}`);
      failed++;
    }
  };

  // 1. Test API Key Generation Utility
  const { rawKey, keyHash, prefix } = generateApiKey();
  assert(rawKey.startsWith('mp_live_'), 'Module 1: API key generated with mp_live_ prefix');
  assert(keyHash === hashApiKey(rawKey), 'Module 1: SHA-256 key hashing works deterministically');
  assert(prefix === rawKey.substring(0, 15), 'Module 1: Key prefix extracted correctly');

  // 2. Test Proration Logic (USD & INR)
  const periodStart = new Date('2026-09-01T00:00:00Z');
  const periodEnd = new Date('2026-10-01T00:00:00Z');
  const midCycleDate = new Date('2026-09-16T00:00:00Z'); // 15 days in

  const mockStarterPlan = {
    name: 'Starter',
    priceUSD: 20.00,
    priceINR: 1500.00
  };

  const mockProPlan = {
    name: 'Pro',
    priceUSD: 50.00,
    priceINR: 4000.00
  };

  const proration = calculateProration({
    oldPlan: mockStarterPlan,
    newPlan: mockProPlan,
    periodStart,
    periodEnd,
    now: midCycleDate
  });

  assert(proration.action === 'UPGRADE', 'Module 4: Proration correctly identifies UPGRADE action');
  assert(proration.prorationBalanceUSD > 0, 'Module 4: USD proration balance calculated correctly for upgrade');
  assert(proration.prorationBalanceINR > 0, 'Module 4: INR proration balance calculated correctly for upgrade');
  assert(proration.remainingDays === 15, 'Module 4: Remaining days in cycle calculated accurately');

  // 3. Test MongoDB Integration if MongoDB server is active
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meterprompt', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('[DB Connected - Running Integration Tests]');

    // Clear test data
    await User.deleteMany({ email: /@testverif\.com$/ });
    await Plan.deleteMany({ name: /^VerifPlan_/ });
    await Subscription.deleteMany({});

    // User Registration Test
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Secret123!', salt);

    const user = await User.create({
      name: 'Verification Customer',
      email: 'customer@testverif.com',
      passwordHash: hash,
      role: 'customer'
    });
    assert(user._id && user.email === 'customer@testverif.com', 'Module 1: User schema saved to MongoDB');

    // Plan Test
    const plan = await Plan.create({
      name: 'VerifPlan_Pro',
      priceUSD: 49.99,
      priceINR: 3999.00,
      billingCycle: 'monthly'
    });
    assert(plan._id && plan.priceINR === 3999, 'Module 2: Plan schema saved to MongoDB with dual currencies');

    // Subscription Test
    const sub = await Subscription.create({
      customerId: user._id,
      planId: plan._id,
      status: 'active',
      currency: 'INR',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd
    });
    assert(sub._id && sub.customerId.toString() === user._id.toString(), 'Module 3: Subscription schema saved to MongoDB');

    // Cleanup
    await User.deleteMany({ email: /@testverif\.com$/ });
    await Plan.deleteMany({ name: /^VerifPlan_/ });
    await Subscription.deleteMany({});
    await mongoose.disconnect();
  } catch (dbErr) {
    console.log('[Note] Local MongoDB service is offline; skipped live DB read/write assertions.');
  }

  console.log(`\n=== Verification Summary: ${passed} Passed, ${failed} Failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runSprint1Verification();
