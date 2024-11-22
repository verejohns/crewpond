import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  sub_users: []
};

const actionMap = {
  [actions.API_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.REQUEST_SUCCESS]: (state, { result }) => ({ ...state, isSubmitting: false, sub_users: result.data.sub_users }),
  [actions.REQUEST_FAILURE]: (state) => ({ ...state, isSubmitting: false })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
