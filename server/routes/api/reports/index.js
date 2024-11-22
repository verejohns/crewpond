const { paths } = require('../../../../utils');
const {reportsController} = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_RUN_REPORT, reportsController.runReport);
};
