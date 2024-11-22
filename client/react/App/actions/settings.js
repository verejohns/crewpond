import { actions, paths } from '../../../../utils';

export default {
  getTerms:() => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_TERMS_REQUEST,
        actions.GET_TERMS_SUCCESS,
        actions.GET_TERMS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_SETTING_TERMS)
    }
  }),
  getFaqs: () => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_FAQS_REQUEST,
        actions.GET_FAQS_SUCCESS,
        actions.GET_FAQS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_SETTING_FAQ)
    }
  }),
};
