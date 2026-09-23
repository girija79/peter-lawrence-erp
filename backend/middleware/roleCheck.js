const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    console.log("ROLE DEBUG:", {
      userId: req.user?._id,
      role: req.user?.role,
      allowedRoles
    });

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied: insufficient permissions'
      });
    }

    next();
  };
};

module.exports = { authorize };