import {
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
  } from 'reactstrap';
  import PropTypes from 'prop-types';
  import React from 'react';
  
  import { Modal } from '..';
  
  const ConfirmModal = (props) => {
    const { id, itemBeingSaved, onConfirm, isSaveModal, title, text } = props;
  
    const saveButton = isSaveModal
      ? (
        <div className=" col-12 d-flex justify-content-center my-3">
          <button data-dismiss="modal" className="btn btn-primary" onClick={() => onConfirm(itemBeingSaved)} >Delete</button>
        </div>
      )
      : null;
  
    return (
      <Modal id={id}>
        <div className="modal-content">
          <Row>
            <Col xs="12">
              <Card>
                <CardHeader>
                  <strong>{title}</strong>
                  <button type="button" data-dismiss="modal" className="close align-self-baseline" aria-label="Close">
                    <span>&times;</span>
                  </button>
                </CardHeader>
                <CardBody>
                  <Col xs="12">
                    <Row>
                      <p>{text}</p>
                    </Row>
                    {saveButton}
                  </Col>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };
  
  ConfirmModal.defaultProps = {
    itemBeingSaved: {},
    isSaveModal: false,
    onConfirm: () => {},
  };
  
  ConfirmModal.propTypes = {
    id: PropTypes.string.isRequired,
    itemBeingSaved: PropTypes.shape({}),
    onConfirm: PropTypes.func,
    text: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isSaveModal: PropTypes.bool,
  };
  
  export default ConfirmModal;
  