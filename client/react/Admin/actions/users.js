import { actions, paths } from '../../../../utils';

export default {
  getUsers: ({offset, orderBy, limit, keyword, location, range, categories}) => ({
    [actions.CALL_API]: {
      types: [
        actions.USERS_GET_REQUEST,
        actions.USERS_GET_SUCCESS,
        actions.USERS_GET_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.APP_USERS), { offset, orderBy, limit, keyword, location, range, categories } ),
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

  sendNotification: (notification) => ({
    [actions.CALL_API]: {
      types: [
        actions.SEND_NOTIFICATION_REQUEST,
        actions.SEND_NOTIFICATION_SUCCESS,
        actions.SEND_NOTIFICATION_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.ADMIN_NOTIFICATION_SEND), notification)
    }
  }),

  sendEmail: (email) => ({
    [actions.CALL_API]: {
      types: [
        actions.SEND_EMAIL_REQUEST,
        actions.SEND_EMAIL_SUCCESS,
        actions.SEND_EMAIL_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.ADMIN_SEND_EMAIL), email)
    }
  }),
};
