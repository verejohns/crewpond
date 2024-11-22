const { paths } = require('../../../../utils');
const { authController } = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_LOGIN, authController.login);
    router.get(paths.api.APP_LOGOUT, authController.logout);

    router.post(paths.api.APP_REGISTER, authController.addUser);
    router.post(paths.api.APP_RESET_PASSWORD, authController.resetPassword);
    router.post(paths.api.APP_FORGOT_PASSWORD, authController.forgotPassword);
    router.post(paths.api.APP_SET_TOKEN, authController.setFcmToken);
    router.post(paths.api.APP_CLEAR_FCM_TOKEN, authController.clearFcmToken);
    router.post(paths.api.APP_RESEND_VERIFICATION_EMAIL, authController.resendVerifyEmail)

    router.post(paths.api.ADMIN_LOGIN, authController.adminLogin);
    router.post(paths.api.APP_SWITCH_ACCOUNT, authController.switchAccount);
    router.post(paths.api.APP_SEND_VERIFICATION_CODE, authController.sendVerificationCode);
    router.post(paths.api.APP_CHECK_VERIFICATION_CODE, authController.checkVerificationCode);
};
