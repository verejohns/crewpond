const { paths } = require('../../../../utils');
const {notificationController} = require("../../../controllers");

module.exports = (router) => {
    router.get(paths.api.APP_NOTIFICATIONS, notificationController.getNotifications);
    router.post(paths.api.APP_NOTIFICATIONS, notificationController.setNotificationAsRead);
    router.post(paths.api.ADMIN_NOTIFICATION_SEND, notificationController.sendNotification);
};
