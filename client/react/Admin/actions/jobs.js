import { actions, paths } from '../../../../utils';

export default {
  getJobs: ({offset, orderBy, limit, keyword, categories, location, range}) => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_JOBS_REQUEST,
        actions.GET_JOBS_SUCCESS,
        actions.GET_JOBS_FAILURE,
      ],
      promise: client => client.post(paths.build(paths.api.APP_JOBS), { offset, orderBy, limit, keyword, categories, location, range }),
    },
  }),

  deleteJob: id => ({
    [actions.CALL_API]: {
      types: [
        actions.DELETE_JOB_REQUEST,
        actions.DELETE_JOB_SUCCESS,
        actions.DELETE_JOB_FAILURE,
      ],
      promise: client => client.delete(paths.build(paths.api.APP_JOB, id)),
    },
  }),

  completeJob: id => ({
    [actions.CALL_API]: {
      types: [
        actions.COMPLETE_JOB_REQUEST,
        actions.COMPLETE_JOB_SUCCESS,
        actions.COMPLETE_JOB_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_JOB_COMPLETED, {id}),
    },
  }),

  uncompleteJob: id => ({
    [actions.CALL_API]: {
      types: [
        actions.UNCOMPLETE_JOB_REQUEST,
        actions.UNCOMPLETE_JOB_SUCCESS,
        actions.UNCOMPLETE_JOB_FAILURE,
      ],
      promise: client => client.post(paths.api.APP_JOB_UNCOMPLETED, {id}),
    },
  }),

  getJob: id => ({
    [actions.CALL_API]: {
      types: [
        actions.GET_JOB_REQUEST,
        actions.GET_JOB_SUCCESS,
        actions.GET_JOB_FAILURE,
      ],
      promise: client => client.get(paths.build(paths.api.APP_JOB_ID, id)),
    },
  }),

  updateJob: (id, job) => {
    const query = new FormData();
    for ( let key in job ) {
      query.append(key, job[key]);
    }

    return {
      [actions.CALL_API]: {
        types: [
          actions.UPDATE_JOB_REQUEST,
          actions.UPDATE_JOB_SUCCESS,
          actions.UPDATE_JOB_FAILURE,
        ],
        promise: client => client.put(paths.build(paths.api.APP_JOB_ID, id), query)
      }
    }
  }
};
