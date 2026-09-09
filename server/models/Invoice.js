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
      enum: ['paid', 'failed', 'pending', 'Paid', 'Pending', 'Failed'],
      default: 'paid'
    },
    paymentAttempts: {
      type: Number,
      default: 1
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
