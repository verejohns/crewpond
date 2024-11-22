import { actions, paths } from '../../../../utils';

export default {
  getInvites: ({job_id, limit, lastValue}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVITES_REQUEST,
        actions.GET_INVITES_SUCCESS,
        actions.GET_INVITES_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_INVITES, {params: {job_id, limit, lastValue}})
    }
  }),

  getInviteById: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVITE_REQUEST,
        actions.GET_INVITE_SUCCESS,
        actions.GET_INVITE_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_INVITE_ID, id))
    }
  }),

  declineInvite: id => ({
    [actions.CALL_API]: {
      types: [
        actions.DECLINE_INVITE_REQUEST,
        actions.DECLINE_INVITE_SUCCESS,
        actions.DECLINE_INVITE_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_INVITE_DECLINE, {id}),
    },
  }),

  createInvite: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_INVITE_RQEUEST,
        actions.CREATE_INVITE_SUCCESS,
        actions.CREATE_INVITE_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_INVITE, postData),
    },
  }),

  //paths.api.APP_INVITE_RECEIVED
  getReceivedInvites: job_id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVITES_REQUEST,
        actions.GET_INVITES_SUCCESS,
        actions.GET_INVITES_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_INVITE_RECEIVED), {params:{job_id}}),
    },
  }),

  //paths.api.APP_INVITE_RECEIVED
  getSentInvites: job_id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_INVITES_REQUEST,
        actions.GET_INVITES_SUCCESS,
        actions.GET_INVITES_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_INVITE_SENT), {params:{job_id}}),
    },
  }),
};
