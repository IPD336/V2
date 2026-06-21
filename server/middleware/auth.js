const jwt = require('jsonwebtoken');

const User = require('../models/User');

module.exports = async function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.fail('No token, access denied', 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role isBanned banReason');
    if (!user) return res.fail('User not found', 401);
    if (user.isBanned) return res.fail('Your account has been suspended.', 403, { reason: user.banReason });

    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    res.fail('Token invalid', 401);
  }
};
