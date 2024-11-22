const { paths } = require('../../utils');

module.exports = (req, res, next) => {
  const { session: { admin } } = req;

  if (!admin) {
    if (req.paths.startsWith('/api'))
      return res.status(500).json({result: "error", errorCode: 0}).end();

    return res.redirect(paths.client.ADMIN_LOGIN);
  }

  return next();
};
