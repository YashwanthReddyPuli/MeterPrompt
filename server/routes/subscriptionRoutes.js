const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  createSubscription,
  getCurrentSubscription,
  changePlan,
  cancelSubscription,
  getCurrentSubscriptionUsage
} = require('../controllers/subscriptionController');

const createSubRules = [
  body('planId').notEmpty().withMessage('planId is required'),
  body('currency').optional().isIn(['USD', 'INR']).withMessage('Currency must be USD or INR')
];

const changePlanRules = [
  param('id').isMongoId().withMessage('Invalid subscription ID'),
  body('newPlanId').isMongoId().withMessage('Valid newPlanId is required')
];

const subIdRules = [
  param('id').isMongoId().withMessage('Invalid subscription ID')
];

router.use(protect);

router.post('/', validate(createSubRules), createSubscription);
router.get('/me', getCurrentSubscription);
router.get('/me/usage', getCurrentSubscriptionUsage);
router.put('/:id/change-plan', validate(changePlanRules), changePlan);
router.put('/:id/cancel', validate(subIdRules), cancelSubscription);

module.exports = router;
