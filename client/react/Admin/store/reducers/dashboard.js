import { actions } from '../../../../../utils';

const initialState = {
    isSubmitting: false,
    isLoadedCardGraph: false,
    card_graph: {},

    isLoadedPaymentGraph: false,
    payment_graph: {},

    isLoadedContractGraph: false,
    contract_graph: {},

    isLoadedTopRatedUsers: false,
    top_rated_users: [],
    
    isLoadedUsersInfo: false,
    users_info: {},

    isLoadedJobsInfo: false,
    jobs_info: {}
};

const actionMap = {

  [actions.ADMIN_GET_CARD_GRAPH_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedCardGraph: false, card_graph: {} }),
  [actions.ADMIN_GET_CARD_GRAPH_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isLoadedCardGraph: true,
    card_graph: result.data,
  }),
  [actions.ADMIN_GET_CARD_GRAPH_FAILURE]: state => ({ ...state, isSubmitting: false, isLoadedCardGraph: false }),

  [actions.ADMIN_GET_PAYMENT_GRAPH_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedPaymentGraph: false, payment_graph: {} }),
  [actions.ADMIN_GET_PAYMENT_GRAPH_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isLoadedPaymentGraph: true,
    payment_graph: result.data,
  }),
  [actions.ADMIN_GET_PAYMENT_GRAPH_FAILURE]: state => ({ ...state, isSubmitting: false, isLoadedPaymentGraph: false }),

  [actions.ADMIN_GET_CONTRACTS_GRAPH_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedContractGraph: false }),
  [actions.ADMIN_GET_CONTRACTS_GRAPH_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isLoadedContractGraph: true,
    contract_graph: result.data,
  }),
  [actions.ADMIN_GET_CONTRACTS_GRAPH_FAILURE]: state => ({ ...state, isSubmitting: false, isLoadedContractGraph: false }),

  [actions.ADMIN_GET_TOP_RATED_USERS_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedTopRatedUsers: false }),
  [actions.ADMIN_GET_TOP_RATED_USERS_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isLoadedTopRatedUsers: true,
    top_rated_users: result.data,
  }),
  [actions.ADMIN_GET_TOP_RATED_USERS_FAILURE]: state => ({ ...state, isSubmitting: false, isLoadedTopRatedUsers: false }),

  [actions.ADMIN_GET_USERS_INFO_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedUsersInfo: false, users_info: {} }),
  [actions.ADMIN_GET_USERS_INFO_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isLoadedUsersInfo: true,
    users_info: result.data,
  }),
  [actions.ADMIN_GET_USERS_INFO_FAILURE]: state => ({ ...state, isSubmitting: false, isLoadedUsersInfo: false }),

  [actions.ADMIN_GET_JOBS_INFO_REQUEST]: state => ({ ...state, isSubmitting: true, isLoadedJobsInfo: false }),
  [actions.ADMIN_GET_JOBS_INFO_SUCCESS]: (state, { result }) => ({
    ...state,
    isSubmitting: false, 
    isLoadedJobsInfo: true,
    jobs_info: result.data,
  }),
  [actions.ADMIN_GET_JOBS_INFO_FAILURE]: state => ({ ...state, isSubmitting: false, isLoadedJobsInfo: false }),
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
