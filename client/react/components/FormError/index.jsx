import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

const FormError = (props) => {
  const { show, error } = props;

  if (show && !isEmpty(error)) {
    return (
      <div style={{color: "red"}} className="input-error"><i className="fa fa-exclamation-triangle" aria-hidden="true" /> {error}</div>
    );
  }

  return null;
};

FormError.defaultProps = {
  error: null,
};

FormError.propTypes = {
  show: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default FormError;
