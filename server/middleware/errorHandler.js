/**
 * Centralized Express Error Handling Middleware
 * Guarantees standard JSON output: { success: false, message, errorCode }
 * Prevents process crashes on unhandled errors.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error Middleware] ${err.name || 'Error'}: ${err.message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle Mongoose Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
      errorCode: 'DUPLICATE_RESOURCE_ERROR'
    });
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      errorCode: 'VALIDATION_ERROR'
    });
  }

  // Handle JWT Auth Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
      errorCode: 'AUTHENTICATION_ERROR'
    });
  }

  // Standard Custom Error Handling or 500 Fallback
  const statusCode = err.statusCode || res.statusCode !== 200 ? (res.statusCode || 500) : 500;
  const errorCode = err.errorCode || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal error occurred.',
    errorCode: errorCode
  });
};

module.exports = errorHandler;
