import { actions, paths } from '../../../../utils';

export default {
  createJob: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.CREATE_JOB_REQUEST,
        actions.CREATE_JOB_SUCCESS,
        actions.CREATE_JOB_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_JOB, postData)
    }
  }),

  getJobs: postData => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_JOBS_REQUEST,
        actions.GET_JOBS_SUCCESS,
        actions.GET_JOBS_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_JOBS, postData)
    }
  }),

  getJobById: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_JOB_REQUEST,
        actions.GET_JOB_SUCCESS,
        actions.GET_JOB_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_JOB_ID, id))
    }
  }),

  getJobbers: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_JOBBERS_REQUEST,
        actions.GET_JOBBERS_SUCCESS,
        actions.GET_JOBBERS_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_JOBBERS, id))
    }
  }),

  updateJob: (id, postData) => {
    return {
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_JOB_REQUEST,
          actions.UPDATE_JOB_SUCCESS,
          actions.UPDATE_JOB_FAILURE,
        ],
        promise: client => client.put(paths.build(paths.api.APP_JOB_ID, id), postData)
      }
    }
  },

  closeJob: id => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_JOB_REQUEST,
        actions.DELETE_JOB_SUCCESS,
        actions.DELETE_JOB_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_JOB_CLOSE, {id}),
    },
  }),

  updateSearchParams: (params) => ({ type: actions.UPDATE_HEADER_PARAMS, params })
};
