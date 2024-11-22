import { actions } from '../../../../../utils';

const initialState = {
    isSubmitting: false,
    isLoadedChatHistory: false, 
    messages: [],

    new_message: {}
};

const actionMap = {
  [actions.RECEIVE_MESSAGE]: (state, message) => ({ ...state, message}),

  [actions.GET_MESSAGES_HISTORY_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedChatHistory: false }),
  [actions.GET_MESSAGES_HISTORY_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isLoadedChatHistory: true,
    messages: result.data,
  }),
  [actions.GET_MESSAGES_HISTORY_FAILURE]: state => ({ ...state, isSubmitting: false, isLoadedChatHistory: false }),

};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
