import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  isLoading: true,
  job: null,
  searchParams: {},
  jobbers: null,
  isJobbersLoading: true,
  jobs: []
};

const actionMap = {
  [actions.CREATE_JOB_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.CREATE_JOB_SUCCESS]: (state) => ({ ...state, isSubmitting: false }),
  [actions.CREATE_JOB_FAILURE]: (state) => ({ ...state, isSubmitting: false }),

  [actions.GET_JOBS_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_JOBS_SUCCESS]: (state, {result}) => ({ ...state, isLoading: false, jobs: result.data.jobs }),
  [actions.GET_JOBS_FAILURE]: (state) => ({ ...state, isLoading: false }),

  [actions.GET_JOB_REQUEST]: state => ({ ...state, isLoading: true }),
  [actions.GET_JOB_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, job: result.data.job }),
  [actions.GET_JOB_FAILURE]: state => ({ ...state, isLoading: false }),

  [actions.UPDATE_JOB_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.UPDATE_JOB_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_JOB_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.DELETE_JOB_REQUEST]: state => ({ ...state, isSubmitting: true }),
  [actions.DELETE_JOB_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.DELETE_JOB_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.GET_JOBBERS_REQUEST]: state => ({ ...state, isJobbersLoading: true }),
  [actions.GET_JOBBERS_SUCCESS]: (state, { result }) => ({ ...state, isJobbersLoading: false, jobbers: result.data.jobbers }),
  [actions.GET_JOBBERS_FAILURE]: state => ({ ...state, isJobbersLoading: false }),

  [actions.UPDATE_HEADER_PARAMS]: (state, { params }) => ({ ...state, searchParams: params})
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
