const { paths } = require('../../../../utils');
const { scheduleController } = require("../../../controllers");

module.exports = (router) => {
    router.put(paths.api.APP_SCHEDULES_IN_TIME, scheduleController.getSchedulesInTime);
    router.put(paths.api.APP_SCHEDULES, scheduleController.getSchedules);
    router.post(paths.api.APP_SCHEDULES, scheduleController.updateSchedules);
    router.get(paths.api.APP_SCHEDULES_LINK, scheduleController.getSchedulesLink);
    router.get(paths.client.APP_SUBSCRIBE, scheduleController.subscribeSchedules);
};
