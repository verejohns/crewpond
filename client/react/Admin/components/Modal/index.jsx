import PropTypes from 'prop-types';
import React from 'react';

const Modal = (props) => {
  const { children, id } = props;

  return (
    <div className="modal fade" tabIndex="-1" data-keyboard id={id}>
      <button type="button" className="d-none" data-toggle="modal" data-target={`#${id}`} />
      <div className="modal-dialog modal-dialog-centered">
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.element.isRequired,
  id: PropTypes.string.isRequired,
};

export default Modal;
