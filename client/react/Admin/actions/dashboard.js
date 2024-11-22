import { actions, paths } from '../../../../utils';

export default {
  getCardGraph: unit => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_CARD_GRAPH_REQUEST,
        actions.ADMIN_GET_CARD_GRAPH_SUCCESS,
        actions.ADMIN_GET_CARD_GRAPH_FAILURE,
      ],
      promise: client => client.get(paths.api.ADMIN_CARD_GRAPH, { params: { unit } }),
    },
  }),

  getPaymentGraph: unit => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_PAYMENT_GRAPH_REQUEST,
        actions.ADMIN_GET_PAYMENT_GRAPH_SUCCESS,
        actions.ADMIN_GET_PAYMENT_GRAPH_FAILURE,
      ],
      promise: client => client.get(paths.api.ADMIN_PAYMENT_GRAPH, { params: { unit } }),
    },
  }),

  getContractGraph: unit => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_CONTRACTS_GRAPH_REQUEST,
        actions.ADMIN_GET_CONTRACTS_GRAPH_SUCCESS,
        actions.ADMIN_GET_CONTRACTS_GRAPH_FAILURE,
      ],
      promise: client => client.get(paths.api.ADMIN_CONTRACT_GRAPH, { params: { unit } }),
    },
  }),

  getUsersInfo: () => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_USERS_INFO_REQUEST,
        actions.ADMIN_GET_USERS_INFO_SUCCESS,
        actions.ADMIN_GET_USERS_INFO_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.ADMIN_USERS_INFO)),
    },
  }),

  getTopRatedUsers: (limit) => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_TOP_RATED_USERS_REQUEST,
        actions.ADMIN_GET_TOP_RATED_USERS_SUCCESS,
        actions.ADMIN_GET_TOP_RATED_USERS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.ADMIN_TOP_RATED_USERS, limit)),
    },
  }),

  getJobsInfo: () => ({
    [actions.CALL_API]: {
      types: [
        actions.ADMIN_GET_JOBS_INFO_REQUEST,
        actions.ADMIN_GET_JOBS_INFO_SUCCESS,
        actions.ADMIN_GET_JOBS_INFO_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.ADMIN_JOBS_INFO)),
    },
  }),

};
