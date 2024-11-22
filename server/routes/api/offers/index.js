const { paths } = require('../../../../utils');
const { offerController } = require("../../../controllers");

module.exports = (router) => {
    router.post(paths.api.APP_OFFERS, offerController.createOffer);
    router.get(paths.api.APP_OFFERS, offerController.getOffers);

    router.get(paths.api.APP_OFFER_ID, offerController.getOfferById);
    router.put(paths.api.APP_OFFER_ID, offerController.updateOffer);
    router.delete(paths.api.APP_OFFER_ID, offerController.deleteOffer);

    router.post(paths.api.APP_ARCHIVE_OFFER, offerController.archiveOffer);

    router.get(paths.api.APP_ARCHIVED_OFFERS, offerController.getArchivedOffers);
    router.post(paths.api.APP_DECLINE_OFFER, offerController.declineOffer);
    router.get(paths.api.APP_LAST_OFFER, offerController.getLastOffer);
};
