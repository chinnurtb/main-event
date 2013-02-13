module.exports = function (req, res, next) {
  res.removeHeader('x-powered-by');
  return next();
};