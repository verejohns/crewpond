import { actions, paths } from '../../../../utils';

export default {
  getNotifications: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_NOTIFICATIONS_REQUEST,
        actions.GET_NOTIFICATIONS_SUCCESS,
        actions.GET_NOTIFICATIONS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_NOTIFICATIONS, {params})
    }
  }),

  getBadgeCount: () => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_BADGE_COUNT_REQUEST,
        actions.GET_BADGE_COUNT_SUCCESS,
        actions.GET_BADGE_COUNT_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_GET_BADGE_COUNT)
    }
  }),

  updateBadgeCount: (params) => {
    return ({ type: actions.UPDATE_BADGE_COUNT, params })
  }
};
