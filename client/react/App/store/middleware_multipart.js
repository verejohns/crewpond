import axios from 'axios';
import { actions as actionTypes, constant, paths } from '../../../../utils';
import { CALL_API_MULTIPART } from '../../../../utils/actions';

export default () => ({ dispatch, getState }) => next => (action) => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  const user_token = localStorage.getItem(constant.USER_TOKEN);
  const callAPIAction = action[actionTypes.CALL_API_MULTIPART];

  if (typeof callAPIAction === 'undefined' || !callAPIAction.promise) {
    return next(action);
  }

  const { promise, types, ...rest } = callAPIAction;
  const [REQUEST, SUCCESS, FAILURE] = types;

  next({ ...rest, type: REQUEST });
  return promise(axios.create({ headers: { 'Content-Type': 'multipart/form-data', 'X-Domain': localStorage.getItem('x-domain') || window.location.host }, 'authentication': user_token }), dispatch)
    .then(
      result => {
        if(result.data.errorCode && result.data.errorCode === 225) {
          window.location.href = paths.client.APP_LOGIN;
        }

        return next({ ...rest, result, type: SUCCESS })
      },
      (error) => {
        next({ ...rest, error, type: FAILURE });
        return Promise.reject(error);
      },
    );
};
