const { paths } = require('../../../../utils');
const { invitesController } = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_INVITE, invitesController.createInvite);
    router.put(paths.api.APP_INVITE_ID, invitesController.updateInvite);
    router.delete(paths.api.APP_INVITE_ID, invitesController.deleteById);
    router.get(paths.api.APP_INVITE_ID, invitesController.getInviteById);
    router.get(paths.api.APP_INVITES, invitesController.getInvites);
    router.post(paths.api.APP_INVITE_DECLINE, invitesController.declineInvite);
    router.get(paths.api.APP_INVITE_RECEIVED, invitesController.getReceivedInvite);
    router.get(paths.api.APP_INVITE_SENT, invitesController.getSentInvite);
};
