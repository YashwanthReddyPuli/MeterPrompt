const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['topup', 'subscription', 'proration'],
      default: 'subscription'
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'open', 'failed', 'past_due', 'Paid', 'Pending', 'Failed'],
      default: 'open'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'pending'
    },
    paymentAttempts: {
      type: Number,
      default: 0
    },
    paymentRetries: {
      type: Number,
      default: 0
    },
    nextRetryDate: {
      type: Date,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    lastFailureReason: {
      type: String,
      default: null
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);



module.exports = mongoose.model('Invoice', invoiceSchema);
