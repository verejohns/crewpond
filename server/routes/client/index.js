const { authController, viewController } = require('../../controllers');
const { paths } = require('../../../utils');

module.exports = (router) => {
    router.get('/', viewController.renderLandingPage);
    router.get(paths.client.APP_TERMS, viewController.renderTermsPage);
    router.get(paths.client.APP_PRIVACY, viewController.renderPrivacyPage);
    router.get(paths.client.APP_PRICING, viewController.renderPricingPage);
    router.get(paths.client.APP_FAQ, viewController.renderFAQPage);
    router.get(paths.client.APP_REDIRECT, viewController.renderRedirectPage);
    router.get(paths.client.APP_BASE, viewController.renderApp);
    router.get(paths.client.APP_LOGIN, viewController.renderApp);
    router.get(paths.client.APP_LOGOUT, authController.logout);
    router.get(paths.client.APP_REGISTER, viewController.renderApp);
    router.get(paths.client.APP_FORGOT_PASSWORD, viewController.renderApp);
    router.get(paths.client.APP_RESET_PASSWORD, authController.gotoReset);
    router.get(paths.client.APP_ACCOUNT_CONFIRM, authController.confirmAccount);
    router.get(paths.client.APP_SUPPORT, viewController.renderApp);
    router.get(paths.client.APP_SUB_USERS, viewController.renderApp);
    router.get(paths.client.APP_WEB_SUBSCRIPTION, viewController.renderApp);
    
    //job page
    router.get(paths.client.APP_NEW_JOB, viewController.renderApp);
    router.get(paths.client.APP_JOBS, viewController.renderApp);
    router.get(paths.client.APP_EDIT_JOB, viewController.renderApp);

    router.get(paths.client.APP_OFFERS, viewController.renderApp);
    router.get(paths.client.APP_CONTRACTS, viewController.renderApp);
    router.get(paths.client.APP_INVITES, viewController.renderApp);
    router.get(paths.client.APP_SCHEDULE, viewController.renderApp);
    router.get(paths.client.APP_PROFILE, viewController.renderApp);
    router.get(paths.client.APP_INVOICES, viewController.renderApp);
    router.get(paths.client.APP_PAYMENT_METHOD, viewController.renderApp);
    router.get(paths.client.APP_SUBSCRIPTIONS, viewController.renderApp);
    router.get(paths.client.APP_MESSAGES, viewController.renderApp);
    router.get(paths.client.APP_REPORTS, viewController.renderApp);
    router.get(paths.client.APP_NOTIFICATIONS, viewController.renderApp);
    router.get(paths.client.APP_SECURITY, viewController.renderApp);
    router.get(paths.client.APP_INVOICES, viewController.renderApp);
    router.get(paths.client.APP_PAYMENT_OPTIONS, viewController.renderApp);
    router.get(paths.client.APP_JOBBER_PROFILE, viewController.renderApp);
    router.get(paths.client.APP_INVITES_REQUEST, viewController.renderApp);
    router.get(paths.client.APP_USER_FAQ, viewController.renderApp);
    router.get(paths.client.APP_USER_TERMS, viewController.renderApp);
    router.get(paths.client.APP_WOKRING_HOURS, viewController.renderApp);

    router.get(paths.client.ADMIN_BASE, viewController.renderAdmin);
    router.get(paths.client.ADMIN_LOGOUT, authController.adminLogout);
    router.get(paths.client.ADMIN_LOGIN, viewController.renderAdmin);
    router.get(paths.client.ADMIN_DASHBOARD, viewController.renderAdmin);
    router.get(paths.client.ADMIN_USERS, viewController.renderAdmin);
    router.get(paths.client.ADMIN_JOBS, viewController.renderAdmin);
    router.get(paths.client.ADMIN_SUBS, viewController.renderAdmin);
    router.get(paths.client.ADMIN_CHAT, viewController.renderAdmin);
    router.get(paths.client.ADMIN_EMAIL, viewController.renderAdmin);
    router.get(paths.client.ADMIN_EDIT_USER, viewController.renderAdmin);
    router.get(paths.client.ADMIN_EDIT_JOB, viewController.renderAdmin);
};
