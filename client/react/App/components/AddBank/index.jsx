import React, { Component } from "react";
import { Modal, ModalBody} from 'reactstrap';
import { ClipLoader } from 'react-spinners';
import ReCAPTCHA from 'react-google-recaptcha';

import PropTypes from "prop-types";


class AddBank extends Component {
    constructor(props) {
        super(props);
        this.state = {
            routing_number: '',
            account_number: '',
            recaptchaToken: ''
        };

        if(this.captchaBank) {
            console.log("Started, Just a second...");
            this.captchaBank.reset();
        }
    }

    verifyCallback = (recaptchaToken) => {
        this.setState({recaptchaToken});
    }

    handleInputChange = ({target: {name, value}}) => {
        this.setState({
            [name]:value
        });
    }

    handleFileInputChange = (event) => {
        this.setState({
            identity_documents: event.target.files
        });
    }

    handleBankSubmit = (ev) => {
        ev.preventDefault();
        const {isSubmitting, onCreate} = this.props;
        this.formRef.classList.add('was-validated');
        
        if (this.formRef.checkValidity() && !isSubmitting) {
            const {routing_number, account_number} = this.state;
            onCreate({routing_number, account_number});
        }
    }

    render () {
        const { handleClose, isSubmitting } = this.props;
        return (
            <Modal isOpen={this.props.isOpen} className="bank-account-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleClose}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Add Bank Account Details</h5>
                    <form ref={ref => this.formRef = ref} onSubmit={this.handleBankSubmit} noValidate>
                        <div className="row mt-3 account-title">
                            <div className="col-12 col-sm-6">BSB</div>
                            <div className="col-12 col-sm-6"><input className="form-control account-content" name="routing_number" required onChange={this.handleInputChange}></input></div>
                        </div>
                        <div className="row mt-2 account-title">
                            <div className="col-12 col-sm-6">Account Number</div>
                            <div className="col-12 col-sm-6"><input className="form-control account-content" name="account_number" required onChange={this.handleInputChange}></input></div>
                        </div>
                        <div className="footer row mt-5">
                            {/* <div className="col-12 mb-3 d-flex flex-column align-items-center">
                                <ReCAPTCHA 
                                    className="recaptcha"
                                    ref={(el) => {this.captchaBank = el;}}
                                    size="normal"
                                    type="image"
                                    sitekey={process.env.RECAPTCHA_SITE_KEY}
                                    onChange={this.verifyCallback}
                                />
                            </div> */}
                            <div className="col-12 d-flex justify-content-end">
                                <button type="submit" className="btn btn-success">{isSubmitting?<ClipLoader size={15} color={"#FFFFFF"}/>:"Save"}</button>
                            </div>
                            
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        )
    }
}

AddBank.defaultProps = {
    isOpen: false,
    isSubmitting: false
};

AddBank.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onCreate: PropTypes.func,
    handleClose: PropTypes.func
};

export default AddBank;
