import { actions } from '../../../../../utils';

const initialState = {
  isLoading: true,
  contract: null,
  contracts: []
};

const actionMap = {
  [actions.GET_CONTRACTS_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_CONTRACTS_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, contracts: result.data.contracts }),
  [actions.GET_CONTRACTS_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_ARCHIEVE_CONTRACT_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_ARCHIEVE_CONTRACT_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, contracts: result.data.contracts }),
  [actions.GET_ARCHIEVE_CONTRACT_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_CONTRACT_REQUEST]: state => ({ ...state, isLoading: true }),
  [actions.GET_CONTRACT_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, contract: result.data.contract }),
  [actions.GET_CONTRACT_FAILURE]: state => ({ ...state, isLoading: false })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
