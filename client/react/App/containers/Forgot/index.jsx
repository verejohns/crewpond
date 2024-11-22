import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import connect from 'react-redux/es/connect/connect';
import { toast } from 'react-toastify';
import PropTypes from "prop-types";

import { paths, functions, messages } from "../../../../../utils";
import selectors from './selectors';
import actions from '../../actions';

class Forgot extends Component {
    handleSubmit = (ev) => {
        ev.preventDefault();
        const { isSubmitting, sendForgot } = this.props;

        if (isSubmitting)
            return;

        this.formRef.classList.add('was-validated');
        if (this.formRef.checkValidity()) {
            const params = functions.parseFormData(new FormData(this.formRef));

            sendForgot(params).then(() => {
                toast.success(messages.SEND_FORGOT_SUCCESS);
            }).catch(({ response: { data } }) => {
                if (data.errorCode === 20) {
                    return toast.error(messages.EMAIL_NOT_CONFIRMED);
                } else if (data.errorCode === 21) {
                    return toast.error(messages.ACCOUNT_CLOSED);
                } else if (data.errorCode === 22) {
                    return toast.error(messages.ACCOUNT_SUSPENDED);
                } else if (data.errorCode === 23) {
                    return toast.error(messages.ACCOUNT_DELETED);
                } else if (data.errorCode !== 0) {
                    return toast.error(messages.EMAIL_NOT_FOUND);
                }

                return toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }
    };

    render() {
        const { isSubmitting } = this.props;

        return (
            <div className="auth-page gradient-background">
                <div className="header text-right" >
                    {/*<Link to={paths.client.APP_LOGIN} className="btn btn-transparent mb-2">To Login</Link>*/}
                </div>

                <div className="container">
                    <a className="logo" href="/">
                        <img src="/static/images/logo-white/logo.png" alt="" />
                        <h3>Crew Pond</h3>
                    </a>
                    <div className="inner-content">
                        <div className="page-title">Reset Password</div>
                        <div className="page-description">
                            Enter your email address and we'll send you an email with instructions to reset your password.
                        </div>

                        <form ref={ref => this.formRef = ref} onSubmit={this.handleSubmit} noValidate>
                            <div className="row">
                                <div className="col-12 form-group">
                                    <input type="email" name="email" className="form-control" placeholder="Email" required />
                                    <div className="invalid-feedback">This field is required.</div>
                                </div>
                            </div>
                            <div className="form-action">
                                <div className="right-wrapper">
                                    <button type="submit" className="btn btn-block btn-success" disabled={isSubmitting}>
                                        {isSubmitting ? <i className="fa fa-spin fa-circle-o-notch" /> : 'Reset'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="footer">
                    <ul>
                        <li><a href={paths.client.APP_TERMS}>Terms & Conditions</a></li>
                        <li><a href={paths.client.APP_PRIVACY}>Privacy Policy</a></li>
                        <li><a href={paths.client.APP_PRICING}>Pricing</a></li>
                        <li><a href={paths.client.APP_FAQ}>FAQ</a></li>
                    </ul>
                </div>
            </div>
        );
    }
}

Forgot.propTypes = {
    sendForgot: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired
};

export default connect(
    selectors,
    { ...actions.authentication }
)(withRouter(Forgot));
