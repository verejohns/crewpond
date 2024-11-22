const { paths } = require('../../../../utils');
const {settingsController} = require("../../../controllers");

module.exports = (router) => {
    router.get(paths.api.APP_SETTING_FAQ, settingsController.getFaqs);
    router.post(paths.api.APP_SETTING_TERMS, settingsController.getTerms);
};
