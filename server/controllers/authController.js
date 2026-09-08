const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateApiKey, hashApiKey } = require('../utils/apiKey');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_meterprompt_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Customer or Admin)
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
        errorCode: 'DUPLICATE_RESOURCE_ERROR'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initial default API key on registration for customers
    const { rawKey, keyHash, prefix } = generateApiKey();

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'customer',
      apiKeys: [{
        keyHash,
        name: 'Default Live Key',
        prefix,
        createdAt: new Date()
      }]
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        apiKey: rawKey // Only shown once upon creation!
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'AUTHENTICATION_ERROR'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'AUTHENTICATION_ERROR'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/api-keys
 * @desc    Create a new API Key for user
 * @access  Private
 */
const createApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { rawKey, keyHash, prefix } = generateApiKey();

    const user = await User.findById(req.user._id);
    user.apiKeys.push({
      keyHash,
      name: name || 'API Key',
      prefix,
      createdAt: new Date()
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'API key generated successfully. Save this raw key securely; it will not be shown again.',
      data: {
        apiKey: rawKey,
        prefix,
        name: name || 'API Key',
        createdAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/auth/api-keys/:keyId
 * @desc    Revoke an API Key
 * @access  Private
 */
const revokeApiKey = async (req, res, next) => {
  try {
    const { keyId } = req.params;
    const user = await User.findById(req.user._id);

    user.apiKeys = user.apiKeys.filter(k => k._id.toString() !== keyId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'API key revoked successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  createApiKey,
  revokeApiKey
};
