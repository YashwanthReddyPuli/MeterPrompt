const mongoose = require('mongoose');

const auditNoteSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['CREATED', 'UPGRADE', 'DOWNGRADE', 'CANCELED', 'RENEWED'],
    required: true
  },
  oldPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  newPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  prorationBalanceUSD: {
    type: Number,
    default: 0
  },
  prorationBalanceINR: {
    type: Number,
    default: 0
  },
  note: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const subscriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan ID is required']
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'grace_period'],
      default: 'active'
    },
    currency: {
      type: String,
      enum: ['USD', 'INR'],
      default: 'USD'
    },
    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now
    },
    currentPeriodEnd: {
      type: Date,
      required: true
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    canceledAt: {
      type: Date,
      default: null
    },
    gracePeriodEnd: {
      type: Date
    },

    prorationBalanceUSD: {
      type: Number,
      default: 0
    },
    prorationBalanceINR: {
      type: Number,
      default: 0
    },
    auditTrail: [auditNoteSchema]
  },
  {
    timestamps: true
  }
);

// MongoDB Index on customerId (as required by PDF specs P17)
subscriptionSchema.index({ customerId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
