const { paths } = require('../../../../utils');
const { userController } = require("../../../controllers");
const { fileParser } = require("../../../middlewares");

module.exports = (router) => {
    router.post(paths.api.APP_USERS, userController.findUsers);

    router.get(paths.api.APP_USER_ID, userController.getUserById);
    router.get(paths.api.APP_USERS_IDS, userController.getUsersByIds);

    router.put(paths.api.APP_USER_ID, fileParser(), userController.updateUser);
    router.delete(paths.api.APP_USER_ID, userController.deleteUser);
    router.post(paths.api.APP_USER_CLOSE, userController.closeAccount);

    router.get(paths.api.APP_GET_JOBBER_TYPE, userController.getJobberType);
    router.post(paths.api.APP_GET_FAVORITE_USERS, userController.getFavoriteUsers);

    router.post(paths.api.APP_UPDATE_PASSWORD, userController.updatePassword);

    router.get(paths.api.APP_GET_BADGE_COUNT, userController.getBadgeCount);
    router.get(paths.api.APP_GET_FAVORITE_JOBBERS, userController.getFavoriteJobbers);

    router.get(paths.api.APP_SUB_USERS, userController.getSubUsers);
    router.post(paths.api.APP_SUB_USERS, userController.addSubUsers);
    router.delete(paths.api.APP_SUB_USER_BY_ID, userController.deleteSubUser);
};
