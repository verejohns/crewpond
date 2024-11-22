import { actions, paths } from '../../../../utils';

export default {
  getUsers: ({offset, orderBy, limit, keyword, location, range, categories, lastValue, lastKeyJobber, jobber_type}) => ({
    [actions.CALL_API]: {
      types: [
        actions.USERS_GET_REQUEST,
        actions.USERS_GET_SUCCESS,
        actions.USERS_GET_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.APP_USERS), { offset, orderBy, limit, keyword, location, range, categories, lastValue, lastKeyJobber, jobber_type } ),
    },
  }),

  getFavoriteUsers: ({offset, orderBy, limit, keyword, location, range, categories, lastValue, jobber_type}) => ({
    [actions.CALL_API]: {
      types: [
        actions.USERS_GET_REQUEST,
        actions.USERS_GET_SUCCESS,
        actions.USERS_GET_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.APP_GET_FAVORITE_USERS), { offset, orderBy, limit, keyword, location, range, categories, lastValue, jobber_type } ),
    },
  }),

  deleteUser: id => ({
    [actions.CALL_API]: {
      types: [
        actions.USER_DELETE_REQUEST,
        actions.USER_DELETE_SUCCESS,
        actions.USER_DELETE_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.APP_USER_ID, id)),
    },
  }),

  deleteSubUser: id => ({
    [actions.CALL_API]: {
      types: [
        actions.SUB_USER_DELETE_REQUEST,
        actions.SUB_USER_DELETE_SUCCESS,
        actions.SUB_USER_DELETE_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.APP_SUB_USER_BY_ID, id)),
    },
  }),

  getUser: id => ({
    [actions.CALL_API]: {
      types: [
        actions.USER_GET_REQUEST,
        actions.USER_GET_SUCCESS,
        actions.USER_GET_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_USER_ID, id)),
    },
  }),

  getSubUsers: () => ({
    [actions.CALL_API]: {
      types: [
        actions.SUB_USERS_GET_REQUEST,
        actions.SUB_USERS_GET_SUCCESS,
        actions.SUB_USERS_GET_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_SUB_USERS),
    },
  }),

  addSubUsers: (postData) => ({
    [actions.CALL_API]: {
      types: [
        actions.SUB_USER_CREATE_REQUEST,
        actions.SUB_USER_CREATE_SUCCESS,
        actions.SUB_USER_CREATE_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.APP_SUB_USERS), postData),
    },
  }),

  updateUser: (id, user) => {
    const query = new FormData();
    for ( let key in user ) {
      query.append(key, user[key]);
    }

    return {
      [actions.CALL_API]: {
        types: [
          actions.USER_UPDATE_REQUEST,
          actions.USER_UPDATE_SUCCESS,
          actions.USER_UPDATE_FAILURE,
        ],
        promise: client => client.put(paths.build(paths.api.APP_USER_ID, id), query)
      }
    }
  },

  updatePassword: params => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.USER_PASSWORD_UPDATE_REQUEST,
          actions.USER_PASSWORD_UPDATE_SUCCESS,
          actions.USER_PASSWORD_UPDATE_FAILURE,
        ],
        promise: client => client.post(paths.api.APP_UPDATE_PASSWORD, params)
      }
    }
  },

  getJobberType: () => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_JOBBER_TYPE_REQUEST,
        actions.GET_JOBBER_TYPE_SUCCESS,
        actions.GET_JOBBER_TYPE_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_GET_JOBBER_TYPE)
    }
  }),

  updateUserSearchParams: (params) => ({ type: actions.UPDATE_HEADER_PARAMS, params })
};
