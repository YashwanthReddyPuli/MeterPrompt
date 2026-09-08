const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

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

module.exports = router;

