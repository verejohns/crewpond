import { actions, paths } from '../../../../utils';

export default {
  getFavoriteJobbers: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_FAVORITE_JOBBERS_REQUEST,
        actions.GET_FAVORITE_JOBBERS_SUCCESS,
        actions.GET_FAVORITE_JOBBERS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_GET_FAVORITE_JOBBERS, id)),
    },
  }),

  favoriteJobber: params => ({
    [actions.CALL_API]: {
      types: [
        actions.UPDATE_FAVORITE_JOBBER_REQUEST,
        actions.UPDATE_FAVORITE_JOBBER_SUCCESS,
        actions.UPDATE_FAVORITE_JOBBER_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_FAVORITE, params),
    },
  }),
};
