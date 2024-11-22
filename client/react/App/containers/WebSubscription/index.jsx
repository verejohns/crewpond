import PropTypes from "prop-types";
import React, { Component } from "react";
import Card from 'react-credit-cards';
import { connect} from "react-redux";
import { toast } from 'react-toastify';

import actions from "../../actions";

import {
    isValidEmail,
    formatCreditCardNumber,
    formatCVC,
    formatExpirationDate,
} from '../../../../../utils/validation';
import { messages, paths } from "../../../../../utils";

import 'react-credit-cards/es/styles-compiled.css';

class WebSubscription extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cvc: '',
            email: decodeURIComponent(new URLSearchParams(document.location.search).get("email")) || null,
            expiry: '',
            focus: '',
            number: '',
            issuer: '',
            withCard: true,
            isSubmitting: false
        };
    }


    validate = () => {
        const { email, number, expiry, cvc, withCard } = this.state;

        if (!email || !isValidEmail(email)) {
            toast.warning("Invalid email provided");
            return false;
        }
        if (withCard) {
            if (number.length < 19) {
                toast.warning("Card number is invalid");
                return false;
            } else if (expiry.split("/").length !== 2) {
                toast.warning("Expiry date is invalid");
                return false;
            } else if (cvc.length < 3) {
                toast.warning("CVC is invalid");
                return false;
            }
        }

        return true;
    }

    handleClick = (ev) => {
        ev.preventDefault();

        const { resumeSuperUser, history: { push } } = this.props;
        const { email, number, expiry, cvc, withCard, loginErrorCode } = this.state;

        if (this.validate()) {
            this.setState({ isSubmitting: true });
            
            resumeSuperUser(
                withCard ? { email, cardNumber: number, expiry, cvc, loginErrorCode } : { email }
            ).then(() => {
                toast.success(messages.SUBSCRIPTION_SUCCESS);
                this.setState({
                    isSubmitting: false
                });
                push(paths.client.APP_BASE);
            }).catch((err) => {
                this.setState({
                    isSubmitting: false
                });
                
                if (err.response && err.response.data) {
                    const { response: { data }} = err;
                    if (data.errorCode === 27) {
                        return toast.error(messages.RECAPTCHA_ERROR);
                    }
                }

                console.log(err.response, err.response.data);
                
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }
    }

    handleCallback = ({ issuer }, isValid) => {
        if (isValid) {
          this.setState({ issuer });
        }
    };

    handleInputFocus = (e) => {
        this.setState({ focus: e.target.name });
    }

    handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'number') {
            value = formatCreditCardNumber(value);
        } else if (name === 'expiry') {
            value = formatExpirationDate(value);
        } else if (name === 'cvc') {
            value = formatCVC(value);
        }

        this.setState({ [name]: value });
    }

    gotoLogin = () => {

        const { history: { push } } = this.props;

        push(paths.client.APP_LOGIN);
    }

    render () {
        const { number, expiry, cvc, focus, issuer, withCard, isSubmitting, email } = this.state;

        return (
            <div className="page-content">
                <div className="container-fluid d-flex justify-content-center">
                    <div className="payment-form">
                        <div className="row align-items-center mt-3">
                            <div className="col-12 text-center">
                                <p>Please add a payment method to continue</p>
                            </div>
                        </div>
                        <div className="row align-items-center mt-3">
                            <div className="col-md-4 text-center">
                                
                                <label className="mb-0">Email</label>
                            </div>
                            <div className="col-md-8">
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    placeholder="Your email"
                                    required
                                    disabled={true}
                                    value={email}
                                    // onChange={this.handleInputChange}
                                />
                            </div>
                        </div>
                        {/* <div className="row align-items-center mt-3">
                            <div className="col-md-4 text-right">
                                <label className="mb-0">Add Payment method</label>
                            </div>
                            <div className="col-md-8">
                                <Switch
                                    checked={withCard}
                                    onChange={(checked) => this.setState({ withCard: checked })}
                                />
                            </div>
                        </div> */}
                        {withCard && (
                            <div className="card mt-5">
                                <Card
                                    cvc={cvc}
                                    expiry={expiry}
                                    focused={focus}
                                    number={number}
                                    callback={this.handleCallback}
                                />
                                <form>
                                    <div className="row">
                                        <div className="col-12 mt-3 d-flex flex-column">
                                            
                                            <label>Card Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="number"
                                                placeholder="Card Number"
                                                pattern="[\d| ]{16,22}"
                                                required
                                                value={number}
                                                onChange={this.handleInputChange}
                                                onFocus={this.handleInputFocus}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mt-3">
                                            <label>Expiry date</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="expiry"
                                                placeholder="Expiry Date"
                                                pattern="\d\d/\d\d"
                                                required
                                                value={expiry}
                                                onChange={this.handleInputChange}
                                                onFocus={this.handleInputFocus}
                                            />
                                        </div>
                                        <div className="col-6 mt-3 d-flex flex-column">
                                            <label>CVV Code</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="cvc"
                                                placeholder="CVC"
                                                pattern="\d{3,4}"
                                                required
                                                value={cvc}
                                                onChange={this.handleInputChange}
                                                onFocus={this.handleInputFocus}
                                            />
                                        </div>
                                        <input type="hidden" name="issuer" value={issuer} />
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className="footer row mt-5 justify-content-center">
                            <div className="col-md-6">
                                <button
                                    className="btn btn-danger"
                                    onClick={this.gotoLogin}
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="col-md-6">
                                <button
                                    className="btn btn-success"
                                    disabled={isSubmitting}
                                    onClick={this.handleClick}
                                >
                                    {isSubmitting ? <i className="fa fa-spin fa-circle-o-notch" /> : 'Add Payment Method'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

WebSubscription.propTypes = {
    resumeSuperUser: PropTypes.func.isRequired,
};

export default connect(
    null,
    { ...actions.subscription }
)(WebSubscription);
