export const restrict = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user attached to request" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied for this role" });
    }

    console.log(`Access granted to ${req.user.role}`);
    next();
  };
};