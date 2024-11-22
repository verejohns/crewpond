import { actions, paths } from '../../../../utils';

export default {
  getCategories: () => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_CATEGORIES_REQUEST,
        actions.ADMIN_GET_CATEGORIES_SUCCESS,
        actions.ADMIN_GET_CATEGORIES_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CATEGORIES),
    },
  }),
};
