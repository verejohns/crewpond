import React, { Component } from "react";
import FacebookLogin from 'react-facebook-login';
import connect from 'react-redux/es/connect/connect';
import PropTypes from "prop-types";
import md5 from 'md5';
import { Link, withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { paths, functions, messages, constant } from "../../../../../utils";
import selectors from './selectors';
import actions from '../../actions';
import { ConfirmDialog } from '../../components';
import ReCAPTCHA from 'react-google-recaptcha';
// import * as serviceWorker from '../../serviceWorker';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            serialNumber: null,
            isSubmitting: false,
            plan_status: null,
            recaptchaToken: '',
            subscription: null,
            trialPeirod: null,
            email: ''
        };

    }

    async componentDidMount() {
        const { tempAction, location: { search }, history: { push } } = this.props;
        const errorCode = (new URLSearchParams(search)).get("errorCode");
        const subscription = (new URLSearchParams(search)).get("subscription");
        if(subscription && subscription === 'true') {
            toast.success(messages.SUBSCRIPTION_SUCCESS);
        }
        // await messaging.requestPermission();
        // tempAction();
        if (errorCode) {
            if (errorCode === '4') {
                toast.error(messages.RESET_TOKEN_EXPIRED);
            } else if (errorCode === '20') {
                toast.error(messages.EMAIL_NOT_CONFIRMED);
            } else if (errorCode === '21') {
                toast.error(messages.ACCOUNT_CLOSED);
            } else if (errorCode === '22') {
                toast.error(messages.ACCOUNT_SUSPENDED);
            } else if (errorCode === '23') {
                toast.error(messages.ACCOUNT_DELETED);
            } else if (errorCode !== '0') {
                toast.error(messages.INVALID_TOKEN);
            } else {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            }

            push(paths.client.APP_LOGIN);
        }
        localStorage.clear();

        if(this.captchaLogin) {
            console.log("Started, Just a second...");
            this.captchaLogin.reset();
        }
        // this.serviceRegister();
    }

    verifyCallback(recaptchaToken) {
        this.setState({recaptchaToken});
    }

    // serviceRegister = () => {
    //     serviceWorker.register({
    //         onSuccess: () => console.log('service worker registered!'),
    //         onUpdate: () => {},
    //     })
    // }

    handleFacebookLogin = (response) => {
        const { login, history: { push } } = this.props;
        const { isSubmitting, recaptchaToken } = this.state;
        if (isSubmitting)
            return;

        this.setState({isSubmitting: true});
        login({
            recaptchaToken,
            access_token: response.accessToken
        }).then(async({result: {data}}) => {
            const { user, sub_users, token } = data;
            localStorage.setItem(constant.LOGGED_ACCOUNT, JSON.stringify(user));
            localStorage.setItem(constant.USER_TOKEN, token);

            this.setState({isSubmitting: false});
            push(paths.client.APP_BASE);
        }).catch(({ response: { data } }) => {
            this.setState({isSubmitting: false});
            if (data.errorCode !== 0) {
                return toast.error(messages.LOGIN_FAILED);
            }

            return toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    };

    loadCards() {
        const {getCards} = this.props;

        getCards()
        .then(({result: {data}}) => {
            if (data.length > 0) {
                localStorage.setItem(constant.PAYMENT_METHOD, JSON.stringify(data[0]));
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    handleSubmit = (ev) => {
        ev.preventDefault();

        const { login, getBadgeCount, history: {push} } = this.props;
        const { isSubmitting } = this.state;
        if (isSubmitting)
            return;

        this.formRef.classList.add('was-validated');
        if (this.formRef.checkValidity()) {
            let params = functions.parseFormData(new FormData(this.formRef));

            params.password = (md5(params.password)).toUpperCase();
            this.setState({isSubmitting: true});
            login(params).then(async({result: {data}}) => {
                const { user, token } = data;
                localStorage.setItem(constant.LOGGED_ACCOUNT, JSON.stringify(user));
                localStorage.setItem(constant.USER_TOKEN, token);
                this.loadCards();
                await getBadgeCount();
                this.setState({isSubmitting: false, trialPeirod: data.trialPeirod});
                console.log(data);
                if(!data.trialPeirod)
                    push(paths.client.APP_BASE);

            }).catch(({ response: { data } }) => {
               console.log(data);
                this.setState({isSubmitting: false});
                if (data.errorCode === 20) {
                    return toast.error(messages.EMAIL_NOT_CONFIRMED);
                } else if (data.errorCode === 21) {
                    return toast.error(messages.ACCOUNT_CLOSED);
                } else if (data.errorCode === 22) {
                    return toast.error(messages.ACCOUNT_SUSPENDED);
                } else if (data.errorCode === 23) {
                    return toast.error(messages.ACCOUNT_DELETED);
                } else if (data.errorCode === 27) {
                    this.captchaLogin.reset();
                    return toast.error(messages.RECAPTCHA_ERROR);
                } else if (data.errorCode === 32) {
                    return toast.error(messages.FREE_TRIAL_FINISHED);
                } else if (data.errorCode === 113 || data.errorCode === 115) {
                    //first web portal
                    const { user, token } = data;
                    this.setState({
                        email: user.email,
                        plan_status: data.errorCode,
                        subscription: null
                    });
                    
                    localStorage.setItem(constant.LOGGED_ACCOUNT, JSON.stringify(user));
                    localStorage.setItem(constant.USER_TOKEN, token);
                    return;
                } else if (data.errorCode === 114) {
                    //first web portal
                    const { user } = data;
                    this.setState({
                        email: user.email,
                        plan_status: data.errorCode,
                        subscription: data.subscription
                    });
                    return;
                } else if (data.errorCode !== 0) {
                    return toast.error(messages.LOGIN_FAILED);
                }

                return toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }
    };

    handleDashboard = () => {
        const { history: {push} } = this.props;
        push(paths.client.APP_BASE);
    }

    createSubscription = () => {
        const stripe = Stripe(process.env.STRIPE_API_KEY);
        stripe.redirectToCheckout({
            items: [{plan: 'super_user_new', quantity: 1}],
            successUrl: process.env.PROTOCOL + '://' + process.env.DOMAIN + '/app/login?subscription=true',
            cancelUrl:  process.env.PROTOCOL + '://' + process.env.DOMAIN + '/app/login?subscription=false',
        }).then(function (result) {
            if (result.error) {
                // If `redirectToCheckout` fails due to a browser or network
                // error, display the localized error message to your customer.
                var displayError = document.getElementById('error-message');
                displayError.textContent = result.error.message;
            }
        });
    }

    getSubscriptionsList = () => {
        
    }

    handleOK = () => {

        const { resumeSuperUser, history: { push } } = this.props;
        const { email, plan_status } = this.state;

        if (plan_status === 113 || plan_status === 115) {
            resumeSuperUser({ email, loginErrorCode: plan_status }
                ).then(() => {
                    toast.success(messages.SUBSCRIPTION_SUCCESS);
                    push(paths.client.APP_BASE);
                }).catch((err) => {
         
                    if (err.response && err.response.data) {
                        const { response: { data }} = err;
                        if (data.errorCode === 27) {
                            return toast.error(messages.RECAPTCHA_ERROR);
                        }
                    }
                    
                    toast.error(messages.INTERNAL_SERVER_ERROR);
                });
        } else if (plan_status === 114) {
            push(paths.client.APP_WEB_SUBSCRIPTION + "?email=" + encodeURIComponent(email));
        }
    }

    render() {
        const { isSubmitting, plan_status, trialPeirod } = this.state;
        let message = null;
        if(plan_status === 113 || plan_status === 115) {
            message = messages.WEB_PORTAL_CONFIRM;
        }else if(plan_status === 114) {
            message = messages.WEB_PORTAL_PLAN_EXPIRED;
        }
        return (
            <div className="auth-page gradient-background">
                <ConfirmDialog isOpen={plan_status !== null} title={"Subscription Confirm"} description={message} ok="OK" onOk={this.handleOK} onCancel={() => this.setState({plan_status: null})}></ConfirmDialog>
                <ConfirmDialog isOpen={trialPeirod} title="Trial Period" description={messages.FREE_TRIAL_WARNING + trialPeirod + " days"} ok="OK" onOk={this.handleDashboard} hideCancel={true}/>

                <div className="header text-right">
                    <Link to={paths.client.APP_REGISTER} className="btn btn-transparent mb-2">Create Account</Link>
                </div>
                <div className="container">
                    <a className="logo" href="/">
                        <img src="/static/images/logo-white/logo.png" alt="" />
                        <h3>Crew Pond</h3>
                    </a>
                    <div className="inner-content">
                        <div className="page-title">Login</div>

                        <form ref={ref => this.formRef = ref} onSubmit={this.handleSubmit} noValidate>
                            <div className="row">
                                <div className="col-12 form-group">
                                    <input type="email" name="email" className="form-control" placeholder="Email" required />
                                    <div className="invalid-feedback">This field is required.</div>
                                </div>
                                <div className="col-12 form-group">
                                    <input type="password" name="password" className="form-control" placeholder="Password" required />
                                    <div className="invalid-feedback">This field is required.</div>
                                </div>
                            </div>
                            <div className="form-action">
                                <div className="left-wrapper">
                                    <Link to={paths.client.APP_FORGOT_PASSWORD} className="mb-2">Forgot Password?</Link>
                                </div>

                                <div className="right-wrapper">
                                    <button type="submit" className="btn btn-block btn-success" disabled={isSubmitting}>
                                        {isSubmitting ? <i className="fa fa-spin fa-circle-o-notch" /> : 'Login'}
                                    </button>
                                </div>
                            </div>
                            <div className="recaptcha-container">
                                <ReCAPTCHA
                                    className="recaptcha"
                                    ref={(el) => {this.captchaLogin = el;}}
                                    size="normal"
                                    type="image"
                                    sitekey={process.env.RECAPTCHA_SITE_KEY}
                                    onChange={this.verifyCallback}
                                />
                            </div>
                        </form>
                        {/*<div className="social-login">*/}
                        {/*    <div className="line-heading">11111Or</div>*/}

                        {/*    <FacebookLogin*/}
                        {/*        appId={process.env.FACEBOOK_APP_ID}*/}
                        {/*        fields="email,first_name,last_name"*/}
                        {/*        cssClass="btn btn-facebook"*/}
                        {/*        icon="fa-facebook"*/}
                        {/*        callback={this.handleFacebookLogin} />*/}
                        {/*</div>*/}
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

Login.propTypes = {
    login: PropTypes.func.isRequired,
    getBadgeCount: PropTypes.func.isRequired,
    resumeSubscription: PropTypes.func.isRequired,
    updateBadgeCount: PropTypes.func.isRequired,
    tempAction: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired,
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }).isRequired,
    getCards: PropTypes.func.isRequired,
    resumeSuperUser: PropTypes.func.isRequired
};

export default connect(
    selectors,
    {
        ...actions.subscription,
        ...actions.authentication,
        ...actions.users,
        ...actions.notifications,
        ...actions.chats,
        ...actions.payments 
    }
)(withRouter(Login));
