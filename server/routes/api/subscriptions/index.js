const { paths } = require('../../../../utils');
const {subscriptionController} = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_KEY_JOBBER_SUBSCRIPTION, subscriptionController.createKeyJobberSubscription);
    router.post(paths.api.APP_KEY_HIRER_SUBSCRIPTION, subscriptionController.createKeyHirerSubscription);
    router.post(paths.api.APP_RESUME_SUBSCRIPTION, subscriptionController.resumeSubscription);
    router.post(paths.api.APP_KEY_JOBBER_SUBSCRIPTION_CANCEL, subscriptionController.cancelKeyJobberSubscription);
    router.post(paths.api.APP_KEY_HIRER_SUBSCRIPTION_CANCEL, subscriptionController.cancelKeyHirerSubscription);
    router.post(paths.api.APP_SUPER_USER_SUBSCRIPTION, subscriptionController.createSuperUserSubscription);
    router.put(paths.api.APP_SUPER_USER_SUBSCRIPTION, subscriptionController.resumeSuperUserSubscription);
    router.delete(paths.api.APP_SUPER_USER_SUBSCRIPTION, subscriptionController.cancelSuperUserSubscription);
    router.get(paths.api.APP_LIST_SUBSCRIPTIONS, subscriptionController.listSubscriptions);
};
