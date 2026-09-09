const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error = new AppError(`Resource not found with ID: ${err.value}`, 404, 'RESOURCE_NOT_FOUND');
  }

  // 2. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value entered for '${field}'. Please use another value.`, 409, 'DUPLICATE_RESOURCE');
  }

  // 3. Mongoose Schema Validation Failure
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val) => val.message);
    error = new AppError(`Validation failed: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR');
  }

  // 4. JWT Verification Failures
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please sign in again.', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please sign in again.', 401, 'SESSION_EXPIRED');
  }

  // 5. Express-Validator Array Errors
  if (Array.isArray(err.errors) && err.errors[0]?.msg) {
    error = new AppError(err.errors.map((e) => e.msg).join('; '), 400, 'INPUT_VALIDATION_FAILED');
  }

  // Log in development
  if (process.env.NODE_ENV !== 'production' && error.statusCode === 500) {
    console.error('SERVER EXCEPTION 💥:', err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'An unexpected internal error occurred on our servers.',
    errorCode: error.errorCode
  });
};

module.exports = errorHandler;
