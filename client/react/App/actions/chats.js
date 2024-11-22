import { actions, paths } from '../../../../utils';

export default {
  createChat: (chat) => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_CHAT_REQUEST,
        actions.CREATE_CHAT_SUCCESS,
        actions.CREATE_CHAT_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_CHAT, chat),
    },
  }),

  updateChat: (id, params) => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_CHAT_REQUEST,
        actions.UPDATE_CHAT_SUCCESS,
        actions.UPDATE_CHAT_FAILURE,
      ],
      promise: client => client.put(paths.build(paths.api.APP_CHAT_ID, id), params),
    },
  }),

  getRoomById: (id) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ROOM_BY_ID_REQUEST,
        actions.GET_ROOM_BY_ID_SUCCESS,
        actions.GET_ROOM_BY_ID_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_CHAT_ID, id)),
    },
  }),

  getChatList: ({limit, orderBy, lastValue, keyword, job_id, roomId}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_ROOMS_REQUEST,
        actions.GET_CHAT_ROOMS_SUCCESS,
        actions.GET_CHAT_ROOMS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CHATS, { params: { limit, orderBy, lastValue, keyword, job_id, roomId } }),
    },
  }),

  getChatListByJobId: ({limit, orderBy, lastValue, job_id}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_ROOMS_BY_JOBID_REQUEST,
        actions.GET_CHAT_ROOMSBY_JOBID__SUCCESS,
        actions.GET_CHAT_ROOMSBY_JOBID__FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CHATS_BY_JOBID, { params: { limit, orderBy, lastValue, job_id } }),
    },
  }),

  getChatRoomByJobber: ({userId, jobId}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_ROOM_BY_JOBBER_REQUEST,
        actions.GET_CHAT_ROOM_BY_JOBBER_SUCCESS,
        actions.GET_CHAT_ROOM_BY_JOBBER_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CHAT_BY_JOBBER, { params: { userId, jobId } }),
    },
  }),

  getMessageHistory: ({room_id, limit, lastValue}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_MESSAGES_HISTORY_REQUEST,
        actions.GET_MESSAGES_HISTORY_SUCCESS,
        actions.GET_MESSAGES_HISTORY_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_MESSAGES, { params: { room_id, limit, lastValue } })
    },
  }),

  sendMessage: ({room_id, text}) => ({
    [actions.CALL_API]: {
      types: [
        actions.SEND_MESSAGE_REQUEST,
        actions.SEND_MESSAGE_SUCCESS,
        actions.SEND_MESSAGE_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_TEXT_MESSAGE, {room_id, text}),
    },
  }),

  archiveChat: (room_id) => ({
    [actions.CALL_API]: {
      types: [
        actions.ARCHIVE_ROOM_REQUEST,
        actions.ARCHIVE_ROOM_SUCCESS,
        actions.ARCHIVE_ROOM_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_ARCHIVE_CHAT, {room_id}),
    },
  }),

  attachMedia: ({room_id, file}) => {
    let data = new FormData();
    data.append('room_id', room_id);
    data.append('avatar', file);

    return{
      [actions.CALL_API]: {
        types: [
            actions.SEND_MEDIA_REQUEST,
            actions.SEND_MEDIA_SUCCESS,
            actions.SEND_MEDIA_FAILURE,
        ],
        promise: client => client.post(paths.api.APP_MEDIA_MESSAGE, data),
      },
    }
  },

  receiveMessage: (message) => ({ type: actions.RECEIVE_MESSAGE, message }),

  deleteChatRoom: () => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_CHAT_ROOM_REQUEST,
        actions.DELETE_CHAT_ROOM_SUCCESS,
        actions.DELETE_CHAT_ROOM_FAILURE,
      ],
      promise: client => client.get(paths.api.ADMIN_DELETE_CHAT_ROOM),
    },
  }),

  getArchivedChatList: ({limit, orderBy, lastValue, keyword}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ARCIVED_CHAT_ROOMS_REQUEST,
        actions.GET_ARCIVED_CHAT_ROOMS_SUCCESS,
        actions.GET_ARCIVED_CHAT_ROOMS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_ARCHIVED_ROOMS, { params: { limit, orderBy, lastValue, keyword } }),
    }
  }),

  getIsArchivedRoom: ({roomId}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_IS_ARCHIVED_ROOM_REQUEST,
        actions.GET_IS_ARCHIVED_ROOM_SUCCESS,
        actions.GET_IS_ARCHIVED_ROOM_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_IS_ARCHIVED_ROOM, { params: { roomId } }),
    }
  }),

  leaveChatRoom: ({room_id}) => ({
    [actions.CALL_API]: {
      types: [
        actions.LEAVE_ROOM_REQUEST,
        actions.LEAVE_ROOM_SUCCESS,
        actions.LEAVE_ROOM_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_LEAVE_FROM_CHAT, {room_id}),
    },
  }),

  deleteUserFromRoom: ({room_id, user_id}) => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_USER_ROOM_REQUEST,
        actions.DELETE_USER_ROOM_SUCCESS,
        actions.DELETE_USER_ROOM_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_DEL_USER_FROM_CHAT, {room_id, user_id}),
    },
  }),

  addUserToRoom: ({room_id, user_ids}) => ({
    [actions.CALL_API]: {
      types: [
        actions.LEAVE_ROOM_REQUEST,
        actions.LEAVE_ROOM_SUCCESS,
        actions.LEAVE_ROOM_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_ADD_USER_TO_CHAT, {room_id, user_ids}),
    },
  }),

  // tempAction: () => ({
  //   [actions.CALL_API]: {
  //     types: [actions.TEMP_ACTION_REQUEST],
  //     promise: client => client.get(paths.api.APP_TEMP_URL),
  //   }
  // }),
};
