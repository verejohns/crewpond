import { actions, paths } from '../../../../utils';

export default {
  login: credentials => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_LOGIN_REQUEST,
        actions.ADMIN_LOGIN_SUCCESS,
        actions.ADMIN_LOGIN_FAILURE,
      ],
      promise: client => client.post(paths.api.ADMIN_LOGIN, credentials)
    }
  }),

  logout: () => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_LOGOUT_REQUEST,
        actions.ADMIN_LOGOUT_SUCCESS,
        actions.ADMIN_LOGOUT_FAILURE,
      ],
      promise: client => client.post(paths.api.ADMIN_LOGOUT)
    }
  }),

  sendForgot: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.API_REQUEST,
        actions.REQUEST_SUCCESS,
        actions.REQUEST_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_FORGOT_PASSWORD, postData)
    }
  }),

  resetLoginState: () => ({ type: actions.RESET_ADMIN_LOGIN_STATE })
};
