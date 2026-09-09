const { requireRole } = require('./auth');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        errorCode: 'AUTHENTICATION_ERROR'
      });
    }

    if (roles.length === 1) {
      return requireRole(roles[0])(req, res, next);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Action not permitted for this role',
        errorCode: 'FORBIDDEN_ROLE_ACCESS'
      });
    }

    next();
  };
};

module.exports = { authorize, requireRole };

