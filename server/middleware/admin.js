module.exports = function adminAuth(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.fail('Access denied: Admins only', 403);
  }
};
