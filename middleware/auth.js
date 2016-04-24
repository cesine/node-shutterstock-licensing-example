function auth(req, res, next) {
  req.authenticated = false;

  next();
};

module.exports = auth;
