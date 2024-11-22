const { paths } = require('../../../../utils');
const {mailController} = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.ADMIN_SEND_EMAIL, mailController.sendEmail);
};
