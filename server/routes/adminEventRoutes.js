const express = require('express');
const router = express.Router();
const BillingEvent = require('../models/BillingEvent');
const { protect, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/admin/events
 * @desc    Get immutable billing event stream for admin inspection
 * @access  Private (Admin)
 */
router.get('/events', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const events = await BillingEvent.find()
      .populate('customerId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
