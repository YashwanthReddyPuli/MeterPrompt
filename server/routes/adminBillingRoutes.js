const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const { protect, requireRole } = require('../middleware/auth');

/**
 * @route   POST /api/billing/retry-failed
 * @desc    Module 11: Admin retry failed invoices & dunning workflow
 * @access  Private (Admin)
 */
router.post('/retry-failed', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const failedInvoices = await Invoice.find({
      status: { $in: ['failed', 'Failed'] },
      paymentRetries: { $lt: 3 }
    });

    let processedCount = 0;

    for (const invoice of failedInvoices) {
      invoice.paymentRetries = (invoice.paymentRetries || 0) + 1;
      invoice.paymentAttempts = (invoice.paymentAttempts || 1) + 1;

      if (invoice.paymentRetries >= 3) {
        invoice.status = 'past_due';
        invoice.nextRetryDate = null;
        
        // Suspend linked subscription if found
        if (invoice.customerId) {
          await Subscription.updateMany(
            { customerId: invoice.customerId, status: { $ne: 'canceled' } },
            { $set: { status: 'past_due' } }
          );
        }
      } else {
        // Set next retry date to 48 hours from now
        invoice.nextRetryDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      }

      await invoice.save();
      processedCount++;
    }

    return res.status(200).json({
      success: true,
      processedInvoices: processedCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/invoices/failed
 * @desc    Get all failed or past_due invoices for Dunning Monitor
 * @access  Private (Admin)
 */
router.get('/invoices/failed', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const failedInvoices = await Invoice.find({
      status: { $in: ['failed', 'Failed', 'past_due', 'open'] }
    })
      .populate('customerId', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: failedInvoices.length,
      data: failedInvoices
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

