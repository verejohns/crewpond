import React, { Component } from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import selectors from './selectors';
import actions from '../../actions';
import { paths, functions, constant, messages } from '../../../../../utils';
import { withRouter } from 'react-router-dom';
import md5 from 'md5';

import { ToastContainer, toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import 'react-toastify/dist/ReactToastify.css';

class Login extends Component {
  constructor() {
    super();

    this.state = {
      recaptchaToken: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    if(this.captchaLogin) {
      this.captchaLogin.reset();
    }
  }

  componentDidMount() {
    localStorage.removeItem('x-domain');
  }

  verifyCallback = (recaptchaToken) => {
    this.setState({recaptchaToken});
  }

  handleSubmit(event) {
    event.preventDefault();
    const { login, history: { push } } = this.props;
    let params = functions.parseFormData(new FormData(this.formRef));
    params.password = (md5(params.password)).toUpperCase();
    login(params)
      .then(({ result: { data } }) => {
        const admin = data.admin
        localStorage.setItem(constant.ADMIN_ACCOUNT, JSON.stringify(admin))
        push(paths.client.ADMIN_DASHBOARD);
      }).catch(({ response: { data } }) => {
        if(this.captchaLogin) {
          console.log("Started, Just a second...");
          this.captchaLogin.reset();
        }
        if(data.errorCode === 27)
          return toast.error(messages.RECAPTCHA_ERROR);
        toast.error(messages.INTERNAL_SERVER_ERROR);
      });
  }

  handleInputChange({ target: { name, value } }) {
    this.setState({
      [name]: value,
    });
  }

  render() {
    return (
      <div className="app flex-row admin-login">
        <ToastContainer/>
        <div className="container">
          <div className="appLogo">
            <img src="/static/images/general_logo.png" className="logo-img"/>
            <div className="logo-title">{"Crew Pond Admin"}</div>
          </div>
          <div className="card login-card" id="login_card_view">
            <div className="card-body">
              <form ref={ref => this.formRef = ref} className="login-form" onSubmit={this.handleSubmit}>
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fa fa-envelope" />
                      </span>
                    </div>
                    <input type="text" className="form-control" placeholder="Admin ID" name="email" required />
                  </div>
                  <div className="input-group mb-4">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fa fa-lock" />
                      </span>
                    </div>
                    <input type="password" className="form-control" placeholder="Password" name="password" required />
                  </div>
                  <div className="form-action">
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
                    <button color="primary" className="btn btn-success px-4 login-button" >{'Login'}</button>
                  </div> 
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

  

export default connect(
  selectors,
  { 
    ...actions.authentication,
  },
)(withRouter(Login));
