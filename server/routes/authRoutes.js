const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getMe,
  createApiKey,
  revokeApiKey
} = require('../controllers/authController');

// Validation rules
const registerRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Role must be customer or admin')
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const apiKeyRules = [
  body('name').optional().trim().notEmpty().withMessage('Key name cannot be empty')
];

// Auth Endpoints
router.post('/register', validate(registerRules), registerUser);
router.post('/login', validate(loginRules), loginUser);
router.get('/me', protect, getMe);

// API Key Management Endpoints
router.post('/api-keys', protect, validate(apiKeyRules), createApiKey);
router.post('/keys', protect, validate(apiKeyRules), createApiKey);
router.delete('/api-keys/:keyId', protect, validate([param('keyId').isMongoId().withMessage('Invalid Key ID')]), revokeApiKey);
router.delete('/keys/:keyId', protect, validate([param('keyId').isMongoId().withMessage('Invalid Key ID')]), revokeApiKey);

module.exports = router;
