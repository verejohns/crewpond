import { actions } from '../../../../../utils';

const initialState = {
  isLoading: true,
  notifications: [],
  badgeCount: {}
};

const actionMap = {
  [actions.GET_NOTIFICATIONS_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_NOTIFICATIONS_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, notifications: result.data.notifications }),
  [actions.GET_NOTIFICATIONS_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_BADGE_COUNT_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_BADGE_COUNT_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, badgeCount: result.data.data }),
  [actions.GET_BADGE_COUNT_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.UPDATE_BADGE_COUNT]: (state, { params }) => {
    return ({ ...state, badgeCount: params})
  }
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
