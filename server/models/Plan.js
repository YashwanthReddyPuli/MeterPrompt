const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    priceUSD: {
      type: Number,
      required: [true, 'Price in USD is required'],
      min: 0
    },
    priceINR: {
      type: Number,
      required: [true, 'Price in INR is required'],
      min: 0
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    featureLimits: {
      maxRequestsPerMinute: {
        type: Number,
        default: 60
      },
      maxTokensPerMonth: {
        type: Number,
        default: 100000
      },
      allowedModels: {
        type: [String],
        default: ['gpt-3.5-turbo', 'gpt-4o-mini', 'mock-llm-v1']
      },
      overageRatePer1kTokensUSD: {
        type: Number,
        default: 0.002 // $0.002 per 1,000 extra tokens
      },
      overageRatePer1kTokensINR: {
        type: Number,
        default: 0.16 // ₹0.16 per 1,000 extra tokens
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Unique index on name is created by unique: true field definition

const Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;
