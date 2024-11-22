import { actions, paths } from '../../../../utils';

export default {
  getFeedbacks: ({job_id, contract_id, user_id, limit, orderBy, lastValue}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_FEEDBACKS_REQUEST,
        actions.GET_FEEDBACKS_SUCCESS,
        actions.GET_FEEDBACKS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_FEEDBACKS, { params: { job_id, contract_id, user_id, limit, orderBy, lastValue }}),
    },
  }),

  deleteFeedback: id => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_FEEDBACK_REQUEST,
        actions.DELETE_FEEDBACK_SUCCESS,
        actions.DELETE_FEEDBACK_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.APP_FEEDBACKS, id)),
    },
  }),

  getFeedbackById: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_FEEDBACK_BY_ID_REQUEST,
        actions.GET_FEEDBACK_BY_ID_SUCCESS,
        actions.GET_FEEDBACK_BY_ID_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_FEEDBACKS, id)),
    },
  }),

  updateFeedback: (id, feedback) => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_FEEDBACK_REQUEST,
          actions.UPDATE_FEEDBACK_SUCCESS,
          actions.UPDATE_FEEDBACK_FAILURE,
        ],
        promise: client => client.put(paths.build(paths.api.APP_FEEDBACKS, id), feedback)
      }
    }
  },

  updateFeedbackByUser: (id, feedback) => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_FEEDBACK_REQUEST,
          actions.UPDATE_FEEDBACK_SUCCESS,
          actions.UPDATE_FEEDBACK_FAILURE,
        ],
        promise: client => client.put(paths.build(paths.api.APP_FEEDBACK_BY_USER, id), feedback)
      }
    }
  }
};
