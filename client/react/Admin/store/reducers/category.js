import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  isCategoriesLoaded: false,
  categories: [],
  isCategoryDeleted: false,
  isCategoryLoaded: false,
  isCategoryUpdated: false,
  isCategoryCreated: false,
  category: {},
};

const actionMap = {
  [actions.ADMIN_GET_CATEGORIES_REQUEST]: state => ({ ...state, isSubmitting: true, isCategoriesLoaded: false }),
  [actions.ADMIN_GET_CATEGORIES_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isCategoriesLoaded: true,
    categories: result.data.categories,
  }),
  [actions.ADMIN_GET_CATEGORIES_FAILURE]: state => ({ ...state, isSubmitting: false, isCategoriesLoaded: false }),

  [actions.CREATE_CATEGORY_REQUEST]: state => ({ ...state, isSubmitting: true, isCategoryDeleted: false }),
  [actions.CREATE_CATEGORY_SUCCESS]: state => ({ ...state, isSubmitting: false, isCategoryDeleted: true }),
  [actions.CREATE_CATEGORY_FAILURE]: state => ({ ...state, isSubmitting: false, isCategoryDeleted: false }),
  
  [actions.DELETE_CATEGORY_REQUEST]: state => ({ ...state, isSubmitting: true, isCategoryCreated: false }),
  [actions.DELETE_CATEGORY_SUCCESS]: state => ({ ...state, isSubmitting: false, isCategoryCreated: true }),
  [actions.DELETE_CATEGORY_FAILURE]: state => ({ ...state, isSubmitting: false, isCategoryCreated: false }),

  [actions.GET_CATEGORY_REQUEST]: state => ({ ...state, isCategoryLoaded: false }),
  [actions.GET_CATEGORY_SUCCESS]: (state, { result }) => ({
    ...state,
    isCategoryLoaded: true,
    category: result.data,
  }),
  [actions.GET_CATEGORY_FAILURE]: state => ({ ...state, isCategoryLoaded: false }),


  [actions.UPDATE_CATEGORY_REQUEST]: state => ({ ...state, isSubmitting: true, isCategoryUpdated: false }),
  [actions.UPDATE_CATEGORY_SUCCESS]: state => ({ ...state, isSubmitting: false, isCategoryUpdated: true }),
  [actions.UPDATE_CATEGORY_FAILURE]: state => ({ ...state, isSubmitting: false, isCategoryUpdated: false }),
  

};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
