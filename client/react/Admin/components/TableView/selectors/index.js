import { createSelector } from 'reselect';

const getLoadingState = state => state.category.isCategoriesLoaded;
const getCategories = state => state.category.categories;

export default createSelector([
  getLoadingState,
  getCategories
], (isCategoriesLoaded, categories) => ({
    isCategoriesLoaded,
    categories
}));
