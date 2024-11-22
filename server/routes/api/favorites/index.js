const { paths } = require('../../../../utils');
const {favoriteController} = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_FAVORITE, favoriteController.favoriteUser)
};
