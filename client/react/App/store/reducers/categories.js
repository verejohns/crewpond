import { actions } from '../../../../../utils';

const initialState = {
  isLoading: false,
  categories: []
};

const actionMap = {
  [actions.GET_CATEGORIES_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_CATEGORIES_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, categories: result.data.categories }),
  [actions.GET_CATEGORIES_FAILURE]: (state) => ({ ...state, isLoading: false })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
