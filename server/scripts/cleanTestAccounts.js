const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const UsageRecord = require('../models/UsageRecord');
const connectDB = require('../config/db');

const cleanTestAccounts = async () => {
  try {
    await connectDB();
    console.log('[Clean] Connected to MongoDB.');

    // Query all users
    const allUsers = await User.find().lean();
    console.log(`[Clean] Found ${allUsers.length} total users in DB.`);

    const testUserIds = [];
    const realUsers = [];

    for (const u of allUsers) {
      const email = (u.email || '').toLowerCase();
      const isTest = 
        !u.email || 
        !u.name || 
        email.includes('@example.com') || 
        email.includes('@meterprompt.io') ||
        email.startsWith('dev_') ||
        email.startsWith('admin_');

      if (isTest) {
        testUserIds.push(u._id);
        console.log(`[Clean] Identified test user to remove: ID=${u._id} Name="${u.name}" Email="${u.email}" Role="${u.role}"`);
      } else {
        realUsers.push(u);
        console.log(`[Clean] Keeping real user: ID=${u._id} Name="${u.name}" Email="${u.email}" Role="${u.role}"`);
      }
    }

    if (testUserIds.length > 0) {
      const deletedSubs = await Subscription.deleteMany({ customerId: { $in: testUserIds } });
      const deletedInvoices = await Invoice.deleteMany({ customerId: { $in: testUserIds } });
      const deletedUsage = await UsageRecord.deleteMany({ customerId: { $in: testUserIds } });
      const deletedUsers = await User.deleteMany({ _id: { $in: testUserIds } });

      console.log(`[Clean] Deleted ${deletedUsers.deletedCount} test users.`);
      console.log(`[Clean] Deleted ${deletedSubs.deletedCount} test subscriptions.`);
      console.log(`[Clean] Deleted ${deletedInvoices.deletedCount} test invoices.`);
      console.log(`[Clean] Deleted ${deletedUsage.deletedCount} test usage records.`);
    } else {
      console.log('[Clean] No test users to remove.');
    }

    // For any remaining admin accounts, ensure creditsBalance is 0 or unset (admins don't have credits)
    const adminUpdate = await User.updateMany({ role: 'admin' }, { $unset: { creditsBalance: "" } });
    console.log(`[Clean] Removed creditsBalance from ${adminUpdate.modifiedCount} admin accounts.`);

    console.log('[Clean] Database cleanup completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Clean Error] Failed to clean test accounts:', err);
    process.exit(1);
  }
};

cleanTestAccounts();
