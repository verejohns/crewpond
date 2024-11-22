import { actions, paths } from '../../../../utils';

export default {
  createChat: (chat) => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_CHAT_REQUEST,
        actions.CREATE_CHAT_SUCCESS,
        actions.CREATE_CHAT_FAILURE,
      ],
      promise: client => client.post(paths.api.ADMIN_CHAT, chat),
    },
  }),
  
  getChatList: ({limit, orderBy, lastValue, keyword, roomId}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CHAT_ROOMS_REQUEST,
        actions.GET_CHAT_ROOMS_SUCCESS,
        actions.GET_CHAT_ROOMS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CHATS, { params: { limit, orderBy, lastValue, keyword, roomId } }),
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
  })
};
