const { paths } = require('../../utils');
var path = require('path');

const authLessPaths = [
    // TODO: includes all user auth less paths
    '/',
    paths.api.APP_LOGIN,
    paths.api.APP_REGISTER,
    paths.api.APP_FORGOT_PASSWORD,
    paths.api.APP_SEND_VERIFICATION_CODE,
    paths.api.APP_CHECK_VERIFICATION_CODE,

    paths.client.APP_LOGIN,
    paths.client.APP_REGISTER,
    paths.client.APP_FORGOT_PASSWORD,
    paths.client.APP_ACCOUNT_CONFIRM,
    paths.client.APP_WEB_SUBSCRIPTION,

    paths.api.APP_STRIPE_WEBHOOK,
    paths.api.APP_RENTP_XML,
    paths.client.FIREBASE_MESSAGING_SW,

    paths.api.APP_TEMP_URL,
    paths.api.APP_STRIPE_WEBHOOK,
    paths.api.APP_RESUME_SUBSCRIPTION,
    paths.api.APP_SUPER_USER_SUBSCRIPTION,

    paths.client.APP_SUBSCRIBE,
];

const resetPasswrdPaths = [
    paths.api.APP_RESET_PASSWORD,
    paths.client.APP_RESET_PASSWORD,
]

const adminAuthLessPaths = [
    // TODO: includes all admin auth less paths
    paths.api.ADMIN_LOGIN,

    paths.client.ADMIN_LOGIN
];

const commonPaths = [
    paths.client.APP_TERMS,
    paths.client.APP_PRIVACY,
    paths.client.APP_PRICING,
    paths.client.APP_FAQ,
    paths.client.APP_REDIRECT
];


module.exports = (req, res, next) => {
  req.isMobileRequest = !!req.headers['x-user-key'];
  if(req.path === paths.client.FIREBASE_MESSAGING_SW) {
      return res.sendFile(path.join(__dirname, '../../static/js', 'firebase-messaging-sw.js'));
  }
  let accessLevel = 1;
  if (commonPaths.includes(req.path)) {
      accessLevel = 0;
  } else if (authLessPaths.includes(req.path)) {
      accessLevel = -1;
  } else if (adminAuthLessPaths.includes(req.path)) {
      accessLevel = -2;
  } else if (resetPasswrdPaths.includes(req.path)) {
      accessLevel = -3;
  }
  req.accessLevel =  accessLevel;

  return next();
};
