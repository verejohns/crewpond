import { actions, paths } from '../../../../utils';

export default {
  login: credentials => ({
    [actions.CALL_API]: {
      types: [
        actions.API_REQUEST,
        actions.REQUEST_SUCCESS,
        actions.REQUEST_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_LOGIN, credentials)
    }
  }),

  register: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.API_REQUEST,
        actions.REQUEST_SUCCESS,
        actions.REQUEST_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_REGISTER, postData)
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

  resetPassword: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.API_REQUEST,
        actions.REQUEST_SUCCESS,
        actions.REQUEST_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_RESET_PASSWORD, postData)
    }
  }),

  switchAccount: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.SWITCH_ACCOUNT_REQUEST,
        actions.SWITCH_ACCOUNT_SUCCESS,
        actions.SWITCH_ACCOUNT_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_SWITCH_ACCOUNT, postData)
    }
  }),

  setFcmToken: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.SET_FCM_TOKEN_REQUEST,
        actions.SET_FCM_TOKEN_SUCCESS,
        actions.SET_FCM_TOKEN_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_SET_TOKEN, postData)
    }
  }),

  clearFcmToken: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CLEAR_FCM_TOKEN_REQUEST,
        actions.CLEAR_FCM_TOKEN_SUCCESS,
        actions.CLEAR_FCM_TOKEN_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_CLEAR_FCM_TOKEN, postData)
    }
  }),
};
