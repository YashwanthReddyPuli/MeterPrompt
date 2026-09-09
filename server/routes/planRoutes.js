const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect, requireRole } = require('../middleware/auth');
const {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
} = require('../controllers/planController');

// Validation rules
const planCreateRules = [
  body('name').notEmpty().withMessage('Plan name is required').trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
  body('priceUSD').optional().isFloat({ min: 0 }).withMessage('priceUSD must be a non-negative number'),
  body('priceINR').optional().isFloat({ min: 0 }).withMessage('priceINR must be a non-negative number'),
  body('billingCycle').optional().isIn(['monthly', 'yearly']).withMessage('billingCycle must be monthly or yearly'),
  body('featureLimits').optional().isObject().withMessage('featureLimits must be an object'),
  body('featureLimits.maxRequestsPerMinute').optional().isInt({ min: 1 }).withMessage('maxRequestsPerMinute must be at least 1'),
  body('featureLimits.maxTokensPerMonth').optional().isInt({ min: 1000 }).withMessage('maxTokensPerMonth must be at least 1000')
];

const mongoIdRules = [
  param('id').isMongoId().withMessage('Invalid Plan ID format')
];

// Plan Endpoints
router.get('/', getPlans);
router.get('/:id', validate(mongoIdRules), getPlanById);

// Admin-only Plan Management (Module 2 & Module 13 RBAC Guard)
router.post('/', protect, requireRole('admin'), validate(planCreateRules), createPlan);
router.put('/:id', protect, requireRole('admin'), validate([...mongoIdRules, ...planCreateRules.map(r => r.optional())]), updatePlan);
router.delete('/:id', protect, requireRole('admin'), validate(mongoIdRules), deletePlan);

module.exports = router;

