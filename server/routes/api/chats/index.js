const { paths } = require('../../../../utils');
const {chatController} = require("../../../controllers");
const { fileParser } = require("../../../middlewares");

module.exports = (router) => {
    router.post(paths.api.ADMIN_CHAT, chatController.createAdminChat);
    router.post(paths.api.APP_CHAT, chatController.createChat);
    router.put(paths.api.APP_CHAT_ID, chatController.updateChat);
    router.post(paths.api.APP_ADD_USER_TO_CHAT, chatController.addUserToChat);
    router.post(paths.api.APP_DEL_USER_FROM_CHAT, chatController.deleteUserFromChat);
    router.post(paths.api.APP_LEAVE_FROM_CHAT, chatController.leaveUserFromChat);
    router.get(paths.api.APP_CHATS, chatController.getChatRooms);
    router.get(paths.api.APP_CHATS_BY_JOBID, chatController.getChatListByJobId);
    router.get(paths.api.APP_CHAT_ID, chatController.getChatRoom);

    router.get(paths.api.APP_MESSAGES, chatController.getMessageHistory);
    router.get(paths.api.APP_MESSAGE_ID, chatController.getMessage);
    router.post(paths.api.APP_TEXT_MESSAGE, chatController.sendMessage);
    router.post(paths.api.APP_MEDIA_MESSAGE, fileParser(), chatController.sendMediaMessage);
    router.post(paths.api.APP_MESSAGE_AS_READ, chatController.setMessageAsRead);
    router.post(paths.api.APP_ARCHIVE_CHAT, chatController.archiveChat);

    router.get(paths.api.APP_ARCHIVED_ROOMS, chatController.getArchivedRooms);

    router.get(paths.api.APP_CHAT_BY_JOBBER, chatController.getChatRoomByJobber);
    router.get(paths.api.APP_IS_ARCHIVED_ROOM, chatController.getIsArchivedRoom);

    // router.get(paths.api.APP_TEMP_URL, chatController.generateChatUsers);
};
