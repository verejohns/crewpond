import React, { Component } from "react";
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import md5 from "md5";
import PropTypes from "prop-types";

import { paths, functions, constant, messages } from "../../../../../utils";
import selectors from './selectors';
import actions from '../../actions';

class Reset extends Component {
    componentDidMount() {
        if(this.captchaLogin) {
            console.log("Started, Just a second...");
            this.captchaLogin.reset();
        }
    }

    confirmPassword = () => {
        const formData = new FormData(this.formRef);
        if (formData.get('password') !== this.confirmRef.value) {
            return this.confirmRef.setCustomValidity("invalid field");
        } else {
            return this.confirmRef.setCustomValidity("");
        }
    };

    handleSubmit = (ev) => {
        ev.preventDefault();
        const { isSubmitting, resetPassword, history: { push }, location: { search } } = this.props;

        if (isSubmitting)
            return;

        this.formRef.classList.add('was-validated');
        if (this.formRef.checkValidity()) {
            let params = functions.parseFormData(new FormData(this.formRef));
            params.token = (new URLSearchParams(search)).get("token");
            params.password = (md5(params.password)).toUpperCase();

            resetPassword(params).then(() => {
                // toast.success(messages.RESET_SUCCESS);
                location.href = '/?successCode=1';
            }).catch(({ response: { data } }) => {
                if (data.errorCode === 4) {
                    return toast.error(messages.RESET_TOKEN_EXPIRED);
                } else if (data.errorCode === 20) {
                    return toast.error(messages.EMAIL_NOT_CONFIRMED);
                } else if (data.errorCode === 21) {
                    return toast.error(messages.ACCOUNT_CLOSED);
                } else if (data.errorCode === 22) {
                    return toast.error(messages.ACCOUNT_SUSPENDED);
                } else if (data.errorCode === 23) {
                    return toast.error(messages.ACCOUNT_DELETED);
                } else if (data.errorCode === 24) {
                    this.captchaLogin.reset();
                    return toast.error(messages.RECAPTCHA_ERROR);
                } else if (data.errorCode !== 0) {
                    return toast.error(messages.INVALID_TOKEN);
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
                        <div className="page-title">Change Password</div>
                        <div className="page-description">
                            Enter your new password.
                        </div>

                        <form ref={ref => this.formRef = ref} onSubmit={this.handleSubmit} noValidate>
                            <div className="row">
                                <div className="col-12 form-group">
                                    <input type="password" name="password" className="form-control" placeholder="Password" required minLength={constant.PASSWORD_MIN_LENGTH} onChange={this.confirmPassword} />
                                    <div className="invalid-feedback">Password must include at least {constant.PASSWORD_MIN_LENGTH} characters.</div>
                                </div>
                                <div className="col-12 form-group">
                                    <input type="password" className="form-control" placeholder="Confirm Password" onChange={this.confirmPassword} ref={ref => this.confirmRef = ref} />
                                    <div className="invalid-feedback">Passwords do not match.</div>
                                </div>
                            </div>
                            <div className="form-action">
                                <div className="left-wrapper">
                                    <div className="recaptcha-container">
                                        <ReCAPTCHA
                                          className="recaptcha"
                                          ref={(el) => this.captchaLogin = el}
                                          size="normal"
                                          type="image"
                                          sitekey={process.env.RECAPTCHA_SITE_KEY}
                                        />
                                    </div>
                                </div>
                                <div className="right-wrapper">
                                    <button type="submit" className="btn btn-block btn-success" disabled={isSubmitting}>
                                        {isSubmitting ? <i className="fa fa-spin fa-circle-o-notch" /> : 'Change'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="footer">
                    <ul>
                        <li><Link to={paths.client.APP_TERMS}>Terms & Conditions</Link></li>
                        <li><Link to={paths.client.APP_PRIVACY}>Privacy Policy</Link></li>
                        <li><Link to={paths.client.APP_PRICING}>Pricing</Link></li>
                        <li><Link to={paths.client.APP_FAQ}>FAQ</Link></li>
                    </ul>
                </div>
            </div>
        );
    }
}

Reset.propTypes = {
    resetPassword: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired,
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }).isRequired
};

export default connect(
    selectors,
    { ...actions.authentication }
)(withRouter(Reset));
