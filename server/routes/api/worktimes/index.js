const { paths } = require('../../../../utils');
const {worktimeController} = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_WORKTIME, worktimeController.createWorkTime);
    router.get(paths.api.APP_WORKTIMES, worktimeController.getWorkTimes);
    router.put(paths.api.APP_WORKTIME_ID, worktimeController.updateWorkTime);
    router.delete(paths.api.APP_WORKTIME_ID, worktimeController.deleteWorkTime);
};
