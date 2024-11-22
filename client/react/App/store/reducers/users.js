import { actions } from '../../../../../utils';

const initialState = {
  isLoading: true,
  searchParams: {},
  user: [],

  sub_users: [],
};

const actionMap = {
  [actions.USER_GET_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.USER_GET_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, user: result.data.user }),
  [actions.USER_GET_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.USERS_GET_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.USERS_GET_SUCCESS]: state => ({ ...state, isLoading: false }),
  [actions.USERS_GET_FAILURE]: state => ({ ...state, isLoading: false }),

  [actions.SUB_USERS_GET_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.SUB_USERS_GET_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, sub_users: result.data.users }),
  [actions.SUB_USERS_GET_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.UPDATE_HEADER_PARAMS]: (state, { params }) => ({ ...state, searchParams: params}),

};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
