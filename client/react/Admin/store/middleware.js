import actions from '../actions';
import axios from 'axios';
 
import { actions as actionTypes } from '../../../../utils';

export default () => ({ dispatch, getState }) => next => (action) => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }

  const callAPIAction = action[actionTypes.CALL_API];

  if (typeof callAPIAction === 'undefined' || !callAPIAction.promise) {
    return next(action);
  }

  const { promise, types, ...rest } = callAPIAction;
  const [REQUEST, SUCCESS, FAILURE] = types;

  next({ ...rest, type: REQUEST });

  return promise(axios.create({ headers: { 'X-Domain': localStorage.getItem('x-domain') || window.location.host } }), dispatch)
    .then(
      result => next({ ...rest, result, type: SUCCESS }),
      (error) => {
        next({ ...rest, error, type: FAILURE });
        return Promise.reject(error);
      },
    );
};
