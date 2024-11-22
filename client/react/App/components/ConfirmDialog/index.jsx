import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody} from 'reactstrap';
import { ClipLoader } from 'react-spinners';

class ConfirmDialog extends Component {
    constructor(props) {
        super(props);
    }

    handleOk = () => {
        const {onOk, isSubmitting} = this.props;
        if(!isSubmitting) {
            onOk();
        }
    }

    render() {
        const { title, description, subDescription, ok, cancel, onCancel, isOpen, isSubmitting, hideCancel } = this.props;

        return (
            <Modal isOpen={isOpen} className="confirm-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    {!hideCancel?<img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={onCancel}/>:null}
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">{title}</h5>
                    <div className="modal-description">
                        <div className={subDescription ? "mainDescription" : ""}>{description}</div>
                        <div className="subDescription">{subDescription}</div>
                    </div>
                    <div className="footer">
                        <button className="btn btn-success" onClick={this.handleOk}>{isSubmitting?<ClipLoader size={15} color={"#FFFFFF"}/>:ok}</button>
                        {!hideCancel?<button className="btn btn-outline-success" onClick={onCancel}>{cancel}</button>:null}
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}

ConfirmDialog.defaultProps = {
    isOpen: false,
    title: "Confirm",
    description: "",
    ok: "OK",
    cancel: "CANCEL",
    isSubmitting: false,
    hideCancel: false
};

ConfirmDialog.propTypes = {
    hideCancel: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    ok: PropTypes.string.isRequired,
    cancel: PropTypes.string.isRequired,
    isSubmitting: PropTypes.bool.isRequired
};

export default ConfirmDialog;
