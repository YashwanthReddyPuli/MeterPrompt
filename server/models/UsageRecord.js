const mongoose = require('mongoose');

const usageRecordSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'Subscription ID is required'],
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    promptTokens: {
      type: Number,
      default: 0
    },
    completionTokens: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    model: {
      type: String,
      trim: true
    },
    costUSD: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast period queries per subscription
usageRecordSchema.index({ subscriptionId: 1, createdAt: -1 });

const UsageRecord = mongoose.model('UsageRecord', usageRecordSchema);

module.exports = UsageRecord;
