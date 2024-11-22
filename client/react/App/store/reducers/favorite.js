import { actions } from '../../../../../utils';

const initialState = {
  isFavoritesLoading: true,
  favorites: []
};

const actionMap = {
  [actions.GET_FAVORITE_JOBBERS_REQUEST]: state => ({ ...state, isFavoritesLoading: true}),
  [actions.GET_FAVORITE_JOBBERS_SUCCESS]: (state, { result }) => ({ ...state, isFavoritesLoading: false, favorites: result.data.favorites }),
  [actions.GET_FAVORITE_JOBBERS_FAILURE]: (state) => ({ ...state, isFavoritesLoading: false })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
