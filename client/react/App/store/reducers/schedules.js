import moment from 'moment';
import { actions } from '../../../../../utils';

const initialState = {
  isSubmitting: false,
  jobs: [],
  isLoading: true,
  headerParams: {
    job_id: null,
    start_date: moment().set({hour: 0, minute: 0, second: 0, millisecond: 0}),
    viewMode: 'day'
  }
};

const actionMap = {
  [actions.GET_SCHEDULES_REQUEST]: state => ({ ...state, isLoading: true}),
  [actions.GET_SCHEDULES_SUCCESS]: (state, { result }) => ({ ...state, isLoading: false, jobs: result.data.jobs }),
  [actions.GET_SCHEDULES_FAILURE]: state => ({ ...state, isLoading: false }),

  [actions.UPDATE_SCHEDULES_REQUEST]: state => ({ ...state, isSubmitting: true}),
  [actions.UPDATE_SCHEDULES_SUCCESS]: state => ({ ...state, isSubmitting: false }),
  [actions.UPDATE_SCHEDULES_FAILURE]: state => ({ ...state, isSubmitting: false }),

  [actions.UPDATE_HEADER_PARAMS]: (state, { params }) => ({ ...state, headerParams: params, jobs: [] }),
  [actions.UPDATE_SCHEDULE]: (state, { data }) => {
    const jobs = [ ...state.jobs ];

    for (let i = 0; i < jobs.length; i++) {
      for (let j = 0; j < jobs[i].schedules.length; j++) {
        if (jobs[i].schedules[j].id === data.id) {
          jobs[i].schedules[j] = data;
          break;
        }
      }
    }

    return { ...state, jobs }
  },
  [actions.REMOVE_JOB]: (state, { id }) => ({ ...state, jobs: state.jobs.filter(job => job.id !== id) })
};

export default (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};
