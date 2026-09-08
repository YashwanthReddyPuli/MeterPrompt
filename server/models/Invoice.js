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
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Paid'
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
