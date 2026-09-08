const { validationResult } = require('express-validator');

/**
 * Middleware wrapper to validate express-validator rules
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation rules sequentially or concurrently
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const firstError = errors.array()[0];
    const formattedMessage = errors.array().map(err => `${err.path}: ${err.msg}`).join('; ');

    return res.status(400).json({
      success: false,
      message: `Validation failed - ${formattedMessage}`,
      errorCode: 'VALIDATION_ERROR',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  };
};

module.exports = validate;
