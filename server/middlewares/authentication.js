const { authController } = require('../controllers');

module.exports = (req, res, next) => {
  if (req.isMobileRequest)
    return authController.validateSessionToken(req, res, next);

  return authController.checkAccessibility(req, res, next);
};
