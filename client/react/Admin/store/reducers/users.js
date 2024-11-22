import { actions } from '../../../../../utils';

const initialState = {
  isUserDeleted: false,
  isSubmitting: false,
  user: {},
  isUserLoaded: false,
  isUserCreated: false,
  users: [],
  isUsersLoaded: false,
  isChatThreadDeleted: false,
  isJobberTypeLoaded: false,
  jobberType: [],
  isUpdatingUser: false
};

const actionMap = {
  [actions.USER_CREATE_REQUEST]: state => ({ ...state, isSubmitting: true, isUserCreated: false }),
  [actions.USER_CREATE_SUCCESS]: state => ({ ...state, isSubmitting: false, isUserCreated: true }),
  [actions.USER_CREATE_FAILURE]: state => ({ ...state, isSubmitting: false, isUserCreated: false }),

  [actions.USERS_GET_REQUEST]: state => ({ ...state, isSubmitting: true, isUsersLoaded: false }),
  [actions.USERS_GET_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isUsersLoaded: true,
    users: result.data,
  }),
  [actions.USERS_GET_FAILURE]: state => ({ ...state, isSubmitting: false, isUsersLoaded: false }),

  [actions.USER_DELETE_REQUEST]: state => ({ ...state, isSubmitting: true, isUserDeleted: false }),
  [actions.USER_DELETE_SUCCESS]: state => ({ ...state, isSubmitting: false, isUserDeleted: true }),
  [actions.USER_DELETE_FAILURE]: state => ({ ...state, isSubmitting: false, isUserDeleted: false }),

  [actions.USER_GET_REQUEST]: state => ({ ...state, isUserLoaded: false }),
  [actions.USER_GET_SUCCESS]: (state, { result }) => ({
    ...state,
    isUserLoaded: true,
    user: result.data.user,
  }),
  [actions.USER_GET_FAILURE]: state => ({ ...state, isUserLoaded: false }),

  [actions.USER_UPDATE_REQUEST]: state => ({ ...state, isUpdatingUser: true }),
  [actions.USER_UPDATE_SUCCESS]: state => ({ ...state, isUpdatingUser: false }),
  [actions.USER_UPDATE_FAILURE]: state => ({ ...state, isUpdatingUser: false }),
  
  [actions.GET_JOBBER_TYPE_REQUEST]: state => ({ ...state, isJobberTypeLoaded: false }),
  [actions.GET_JOBBER_TYPE_SUCCESS]: (state, { result }) => ({
    ...state,
    isJobberTypeLoaded: true,
    jobberType: result.data,
  }),
  [actions.GET_JOBBER_TYPE_FAILURE]: state => ({ ...state, isJobberTypeLoaded: false }),
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
