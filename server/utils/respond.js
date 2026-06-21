function respondMiddleware(req, res, next) {
  res.respond = (data, status = 200) => {
    const obj = typeof data?.toObject === 'function' ? data.toObject() : data;
    res.status(status).json({ success: true, ...obj });
  };

  res.respondArray = (items, name = 'data') => {
    res.json({ success: true, [name]: items });
  };

  res.fail = (message, status = 400, extra = {}) => {
    res.status(status).json({ success: false, message, ...extra });
  };

  next();
}

module.exports = respondMiddleware;
