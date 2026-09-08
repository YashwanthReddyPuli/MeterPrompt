/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * Enforces permissions for Customer vs Billing Admin
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        errorCode: 'AUTHENTICATION_ERROR'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route. Required role: ${roles.join(' or ')}.`,
        errorCode: 'AUTHORIZATION_ERROR'
      });
    }

    next();
  };
};

module.exports = { authorize };
