import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import actions from '../../actions';
import md5 from 'md5';
import { messages } from "../../../../../utils";

import {toast} from 'react-toastify';

class Security extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_password: '',
            new_password: '',
            confirm_password: ''
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSubmit(ev) {
        let {current_password, new_password, confirm_password} = this.state;
        const {updatePassword} = this.props;

        ev.preventDefault();
        if (this.formRef.checkValidity()) {
            this.formRef.classList.add('was-validated');
            if(new_password !== confirm_password){
                toast.warning(messages.PASSWWORD_NO_MATCH);
                return;
            }
            current_password = (md5(current_password)).toUpperCase();
            new_password = (md5(new_password)).toUpperCase();
            updatePassword({current_password, new_password})
            .then(() => {
                toast.success(messages.RESET_SUCCESS);
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            })
        }
    }

    handleInputChange({target: {id, value}}) {
        this.setState({ [id]: value });
    }

    render() {
        return (
            <React.Fragment>
                <div className="page-content ">
                    <div className="security-content">
                        <form ref={ref => this.formRef = ref}asd onSubmit={this.handleSubmit}>
                            <div className="row align-items-center mb-2">
                                <div className="col-md-12">
                                    <h5 className="text-center text-md-left">Password and Security</h5>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input type="password" id="current_password" className="form-control" placeholder="Current Password" onChange={this.handleInputChange} required></input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input type="password" id="new_password" className="form-control" placeholder="New Password" onChange={this.handleInputChange} required></input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <input type="password" id="confirm_password" className="form-control" placeholder="Confirm Password" onChange={this.handleInputChange} required></input>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    {/* <button type="button" className="btn btn-outline-success btn-block">Set Passcode</button> */}
                                </div>
                                <div className="col-md-6">
                                    <button type="submit" className="btn btn-success btn-block">Change Password</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

Security.propTypes = {
    updatePassword: PropTypes.func.isRequired
};

export default  connect(
    null,
    {...actions.users}
)(Security);
