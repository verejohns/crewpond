import { actions } from '../../../../../utils';

const initialState = {
  isLoading: true,
  invite: null
};

const actionMap = {
  [actions.GET_INVITES_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_INVITES_SUCCESS]: (state) => ({ ...state, isLoading: false }),
  [actions.GET_INVITES_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_INVITE_REQUEST]: state => ({ ...state, isLoading: true }),
  [actions.GET_INVITE_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, invite: result.data.invite }),
  [actions.GET_INVITE_FAILURE]: state => ({ ...state, isLoading: false })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
