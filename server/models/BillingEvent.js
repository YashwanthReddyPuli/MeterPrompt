const mongoose = require('mongoose');

const billingEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
      required: true,
      default: () => `evt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
    },
    type: {
      type: String,
      required: true,
      index: true,
      enum: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.cancel_scheduled',
        'invoice.created',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'customer.discount.applied'
      ]
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    summary: {
      type: String,
      default: null
    },
    data: {
      object: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      previousAttributes: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      }
    },
    request: {
      ip: String,
      userAgent: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BillingEvent', billingEventSchema);
