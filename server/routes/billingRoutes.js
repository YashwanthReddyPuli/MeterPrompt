const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

const { dispatchBillingEvent } = require('../utils/eventBus');

const topUpRules = [
  body('amount').notEmpty().withMessage('Amount is required')
];

/**
 * @route   POST /api/billing/top-up
 * @desc    Top up user credit balance ($10.00 minimum enforcement)
 * @access  Private
 */
router.post('/top-up', protect, validate(topUpRules), async (req, res, next) => {
  try {
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount < 10.00) {
      return res.status(400).json({
        success: false,
        message: 'Minimum credit top-up amount is $10.00.',
        errorCode: 'MIN_TOPUP_AMOUNT_REQUIRED'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    user.creditsBalance = Number(((user.creditsBalance || 0) + amount).toFixed(2));
    await user.save();

    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;

    // Create Invoice record in DB
    const invoice = await Invoice.create({
      customerId: user._id,
      invoiceNumber: invoiceId,
      amount: amount,
      currency: 'USD',
      type: 'topup',
      description: 'Balance Top-Up',
      status: 'Paid',
      date: new Date()
    });

    await dispatchBillingEvent({
      type: 'invoice.payment_succeeded',
      customerId: user._id,
      summary: `${user.name || user.email} topped up credit balance by $${amount.toFixed(2)}`,
      object: {
        invoiceId: invoice.invoiceNumber,
        amount: invoice.amount,
        status: 'paid',
        type: 'topup'
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Successfully topped up credit balance by $${amount.toFixed(2)}.`,
      data: {
        creditsBalance: user.creditsBalance,
        topUpAmount: amount,
        invoiceId: invoice.invoiceNumber,
        last4: '4242',
        barcode: `849204${Date.now().toString().slice(-4)}`
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/billing/history
 * @desc    Get user's invoice & payment history
 * @access  Private
 */
const getInvoiceHistory = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

router.get('/history', protect, getInvoiceHistory);
router.get('/invoices', protect, getInvoiceHistory);

/**
 * @route   PUT /api/invoices/:id/pay or /api/billing/invoices/:id/pay
 * @desc    Module 7: Update payment status, increment payment attempts, and log failure reason
 * @access  Private
 */
const payInvoiceHandler = async (req, res, next) => {
  try {
    const { paymentStatus, failureReason } = req.body;
    
    // Normalize status to lowercase string matching spec ('paid' | 'failed' | 'pending')
    const normalizedStatus = (paymentStatus || 'paid').toLowerCase();

    if (!['paid', 'failed', 'pending'].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paymentStatus. Must be 'paid', 'failed', or 'pending'.",
        errorCode: 'INVALID_PAYMENT_STATUS'
      });
    }

    let invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      // Also attempt lookup by invoiceNumber if mongo ID not found
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    invoice.paymentAttempts = (invoice.paymentAttempts || 0) + 1;
    invoice.status = normalizedStatus;
    if (normalizedStatus === 'failed') {
      invoice.lastFailureReason = failureReason || 'Card declined or insufficient funds';
    } else {
      invoice.lastFailureReason = null;
    }

    await invoice.save();

    const eventType = normalizedStatus === 'failed' ? 'invoice.payment_failed' : 'invoice.payment_succeeded';
    const actionLabel = normalizedStatus === 'failed' ? `Payment failed ($${invoice.amount.toFixed(2)})` : `Payment of $${invoice.amount.toFixed(2)} succeeded`;
    await dispatchBillingEvent({
      type: eventType,
      customerId: invoice.customerId,
      summary: `${actionLabel} for invoice ${invoice.invoiceNumber}`,
      object: {
        invoiceId: invoice.invoiceNumber,
        amount: invoice.amount,
        status: normalizedStatus,
        failureReason: invoice.lastFailureReason
      },
      req
    });

    return res.status(200).json({
      success: true,
      message: `Invoice status updated to '${normalizedStatus}'.`,
      data: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        paymentAttempts: invoice.paymentAttempts,
        lastFailureReason: invoice.lastFailureReason,
        amount: invoice.amount,
        updatedAt: invoice.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @route   POST /api/invoices/generate
 * @desc    Generate periodic cycle invoice for customer
 * @access  Private
 */
const generatePeriodicInvoice = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const amount = req.body.amount !== undefined ? parseFloat(req.body.amount) : 49.99;
    const description = req.body.description || 'Periodic Cycle Invoice Settlement';

    const invoice = await Invoice.create({
      customerId,
      invoiceNumber,
      amount,
      currency: 'USD',
      type: 'subscription',
      description,
      status: 'Paid',
      date: new Date()
    });

    await dispatchBillingEvent({
      type: 'invoice.created',
      customerId,
      summary: `Periodic cycle invoice ${invoiceNumber} generated for $${amount.toFixed(2)}`,
      object: {
        invoiceId: invoiceNumber,
        amount,
        status: 'paid'
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Periodic cycle invoice generated successfully.',
      invoice
    });
  } catch (error) {
    next(error);
  }
};

router.get('/', protect, getInvoiceHistory);
router.post('/generate', protect, generatePeriodicInvoice);
router.put('/:id/pay', protect, payInvoiceHandler);

module.exports = router;
module.exports.payInvoiceHandler = payInvoiceHandler;


