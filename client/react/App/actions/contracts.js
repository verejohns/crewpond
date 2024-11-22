import { actions, paths } from '../../../../utils';

export default {
  createContract: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_CONTRACT_REQUEST,
        actions.CREATE_CONTRACT_SUCCESS,
        actions.CREATE_CONTRACT_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_CONTRACTS, postData)
    }
  }),

  getContracts: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CONTRACTS_REQUEST,
        actions.GET_CONTRACTS_SUCCESS,
        actions.GET_CONTRACTS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CONTRACTS, {params})
    }
  }),

  getContractById: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CONTRACT_REQUEST,
        actions.GET_CONTRACT_SUCCESS,
        actions.GET_CONTRACT_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_CONTRACT_ID, id))
    }
  }),

  getContractByJobber: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_CONTRACT_BY_JOBBER_REQUEST,
        actions.GET_CONTRACT_BY_JOBBER_SUCCESS,
        actions.GET_CONTRACT_BY_JOBBER_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CONTRACT_BY_JOBBER, {params})
    }
  }),

  closeAllContract: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CLOSE_ALL_CONTRACTS_REQUEST,
        actions.CLOSE_ALL_CONTRACTS_SUCCESS,
        actions.CLOSE_ALL_CONTRACTS_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_CLOSE_CONTRACT_ALL, postData)
    }
  }),

  archieveAllContracts: job_id => ({
    [actions.CALL_API]: {
      types: [
        actions.ARCHIEVE_ALL_CONTRACTS_REQUEST,
        actions.ARCHIEVE_ALL_CONTRACTS_SUCCESS,
        actions.ARCHIEVE_ALL_CONTRACTS_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_ARCHIVE_CONTRACT_ALL, {job_id})
    }
  }),

  assignSchedules: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.ASSIGN_SCHEDULE_REQUEST,
        actions.ASSIGN_SCHEDULE_SUCCESS,
        actions.ASSIGN_SCHEDULE_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_ADD_SCHEDULE_TO_CONTRACT, postData)
    }
  }),

  unassignSchedules: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.ASSIGN_SCHEDULE_REQUEST,
        actions.ASSIGN_SCHEDULE_SUCCESS,
        actions.ASSIGN_SCHEDULE_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_REMOVE_SCHEDULE_FROM_CONTRACT, postData)
    }
  }),
  
  closeContract: id => ({
    [actions.CALL_API]: {
      types: [
        actions.UNASSIGN_SCHEDULE_REQUEST,
        actions.UNASSIGN_SCHEDULE_SUCCESS,
        actions.UNASSIGN_SCHEDULE_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_CLOSE_CONTRACT, {id})
    }
  }),

  archieveContract: id => ({
    [actions.CALL_API]: {
      types: [
        actions.ARCHIEVE_CONTRACT_REQUEST,
        actions.ARCHIEVE_CONTRACT_SUCCESS,
        actions.ARCHIEVE_CONTRACT_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_ARCHIVE_CONTRACT, {id})
    }
  }),

  getArchieveContract: params => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_ARCHIEVE_CONTRACT_REQUEST,
        actions.GET_ARCHIEVE_CONTRACT_SUCCESS,
        actions.GET_ARCHIEVE_CONTRACT_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_ARCHIVED_CONTRACTS, {params})
    }
  }),

  findContractJobbers: params => ({
    [actions.CALL_API]: {
      types: [
        actions.FIND_CONTRACT_JOBBERS_REQUEST,
        actions.FIND_CONTRACT_JOBBERS_SUCCESS,
        actions.FIND_CONTRACT_JOBBERS_FAILURE,
      ],
      promise: client => client.get(paths.api.APP_CONTRACT_JOBBERS, {params})
    }
  }),
};
