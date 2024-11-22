import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  isFeedbacksLoaded: false,
  feedbacks: [],
  isFeedbackDeleted: false,
  isFeedbackLoaded: false,
  feedback: {},
};

const actionMap = {
  [actions.GET_FEEDBACKS_REQUEST]: state => ({ ...state, isSubmitting: true, isFeedbacksLoaded: false }),
  [actions.GET_FEEDBACKS_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isFeedbacksLoaded: true,
    feedbacks: result.data,
  }),
  [actions.GET_FEEDBACKS_FAILURE]: state => ({ ...state, isSubmitting: false, isFeedbacksLoaded: false }),

  
  [actions.DELETE_FEEDBACK_REQUEST]: state => ({ ...state, isSubmitting: true, isFeedbackDeleted: false }),
  [actions.DELETE_FEEDBACK_SUCCESS]: state => ({ ...state, isSubmitting: false, isFeedbackDeleted: true }),
  [actions.DELETE_FEEDBACK_FAILURE]: state => ({ ...state, isSubmitting: false, isFeedbackDeleted: false }),

  [actions.GET_FEEDBACK_BY_ID_REQUEST]: state => ({ ...state, isFeedbackLoaded: false }),
  [actions.GET_FEEDBACK_BY_ID_SUCCESS]: (state, { result }) => ({
    ...state,
    isFeedbackLoaded: true,
    feedback: result.data,
  }),
  [actions.GET_FEEDBACK_BY_ID_FAILURE]: state => ({ ...state, isFeedbackLoaded: false }),


  [actions.UPDATE_FEEDBACK_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_FEEDBACK_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_FEEDBACK_FAILURE]: state => ({ ...state, isSubmitting: false }),
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
