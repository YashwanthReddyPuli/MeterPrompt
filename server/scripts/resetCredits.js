const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');
const connectDB = require('../config/db');

const resetCredits = async () => {
  try {
    await connectDB();
    const result = await User.updateMany({}, { $set: { creditsBalance: 0.00 } });
    console.log(`Reset credit balances to 0.00 for ${result.modifiedCount || result.nModified || 0} user documents.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

resetCredits();
