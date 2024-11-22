import { actions, paths } from '../../../../utils';

export default {
  createOffer: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_OFFER_REQUEST,
        actions.CREATE_OFFER_SUCCESS,
        actions.CREATE_OFFER_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_OFFERS, postData)
    }
  }),

  getOffers: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_OFFERS_REQUEST,
        actions.GET_OFFERS_SUCCESS,
        actions.GET_OFFERS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_OFFERS, {params})
    }
  }),

  getArchivedOffers: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ARCHIVED_OFFERS_REQUEST,
        actions.GET_ARCHIVED_OFFERS_SUCCESS,
        actions.GET_ARCHIVED_OFFERS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_ARCHIVED_OFFERS, {params})
    }
  }),

  getOfferById: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_OFFER_REQUEST,
        actions.GET_OFFER_SUCCESS,
        actions.GET_OFFER_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_OFFER_ID, id))
    }
  }),

  updateOffer: (id, params) => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_OFFER_REQUEST,
        actions.UPDATE_OFFER_SUCCESS,
        actions.UPDATE_OFFER_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.APP_OFFER_ID, id), params)
    }
  }),

  deleteOffer: (id) => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_OFFER_REQUEST,
        actions.DELETE_OFFER_SUCCESS,
        actions.DELETE_OFFER_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.APP_OFFER_ID, id))
    }
  }),

  archiveOffer: (offer_id) => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_OFFER_REQUEST,
        actions.UPDATE_OFFER_SUCCESS,
        actions.UPDATE_OFFER_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_ARCHIVE_OFFER, {offer_id})
    }
  }),

  declineOffer: (offer_id) => ({
    [actions.CALL_API]: {
      types: [
        actions.DECLINE_OFFER_REQUEST,
        actions.DECLINE_OFFER_SUCCESS,
        actions.DECLINE_OFFER_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_DECLINE_OFFER, {offer_id})
    }
  }),
};
