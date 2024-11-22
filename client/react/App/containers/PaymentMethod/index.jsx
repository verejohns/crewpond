import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import actions from "../../actions";
import {
    formatCreditCardNumber,
    formatCVC,
    formatExpirationDate,
}   from '../../../../../utils/validation';
import { messages, constant } from "../../../../../utils";

import Card from 'react-credit-cards';
import ReCAPTCHA from 'react-google-recaptcha';
import { Loader } from "../../../components";
import { AddBank, ConfirmDialog } from "../../components";
import { toast } from 'react-toastify';
import 'react-credit-cards/es/styles-compiled.css';

class PaymentMethod extends Component {
    constructor(props) {
        super(props);

        this.state = {
            card_lists: [],
            bank_list: [],

            cvc: '',
            expiry: '',
            focus: '',
            number: '',
            issuer: '',

            isOpen: false,
            isForm: false,
            isLoadingBanks: false,
            isLoadingCards: false,

            account_number: '',
            routing_number: '',
            selectedCard: JSON.parse(localStorage.getItem(constant.PAYMENT_METHOD)),
            selectedBank: null,
            isEditable: false,

            isConfirmOpen: false,
            isCardDelete: false,
            isSubmitting: false,
            recaptchaCardToken: '',
            verificationStatus: ''
        };
        if(this.captchaCard) {
            console.log("Started, Just a second...");
            this.captchaJob.reset();
        }

        this.handleBankSubmit = this.handleBankSubmit.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.verifyAccount = this.verifyAccount.bind(this);
        this.paymentMethod = JSON.parse(localStorage.getItem(constant.PAYMENT_METHOD)),
        this.checkVerified = this.checkVerified.bind(this);
    }

    componentDidMount() {
        this.loadBankAccounts();
        this.loadCards();
        this.checkVerified();
        if (!this.paymentMethod) {
            toast.error(messages.PAYMENT_METHOD_EMPTY)
        } else {
            this.setState({
                selectedCard: this.paymentMethod
            });
        }
    }

    verifyCallback = (recaptchaCardToken) => {
        this.setState({recaptchaCardToken})
    }
    loadBankAccounts() {
        const {getAllBankAccounts} = this.props;
        this.setState({
            isLoadingBanks: true,
        })
        getAllBankAccounts()
        .then(({result: {data}}) => {
            this.setState({
                isLoadingBanks:false,
                bank_list: data.data
            });
        }).catch(() => {
            this.setState({
                isLoadingBanks:false
            });
        });
    }

    verifyAccount() {
        const { verifyUserAccount } = this.props;
        
        const refresh_url = window.location.href;
        const return_url = window.location.href;

        verifyUserAccount({refresh_url, return_url})
        .then(({result: {data}}) => {
            window.location.replace(data.url);
        }).catch((error) => {
            console.log(error);
        });
    }

    checkVerified() {
        const { checkAccountVerified } = this.props;
        const { verificationStatus } = this.state;

        checkAccountVerified()
        .then((res) => {
            this.setState({
                verificationStatus: res.result.data
            });

        }).catch(({ response: { data } }) => {
            console.log(data.errorMessage);
        });
    }

    loadCards() {
        const {getCards} = this.props;
        this.setState({
            isLoadingCards: true
        })
        getCards()
        .then(({result: {data}}) => {
            this.setState({
                isLoadingCards:false,
                card_lists: data
            });
        }).catch(() => {
            this.setState({
                isLoadingCards:false,
            });
        });
    }

    validate() {
        const { number, expiry, cvc, isEditable } = this.state;

        if(number.length < 19 && !isEditable) {
            toast.warning("Card number is invalid");
            return false;
        }else if(expiry.split("/").length !== 2) {
            toast.warning("Expiry date is invalid");
            return false;
        }else if(cvc.length < 3 && !isEditable) {
            toast.warning("CVC is invalid");
            return false;
        }
        return true;
    }

    handleClick(ev) {
        ev.preventDefault();
        if(ev.target.id === 'show_card_but') {
            this.setState({
                isEditable: false,
                selectedCard: null,
                isForm: true,
                number: '',
                expiry: '',
                cvc: ''
            });
        }else if(ev.target.id === 'add-bank-but') {
            this.setState({isOpen: true});
        }else if(ev.target.id === 'cancel_card_but') {
            this.setState({isForm: false})
        }else if(ev.target.id === 'add_card_but') {
            const {createCard, updateCard} = this.props;
            const {number, expiry, cvc, isEditable, selectedCard} = this.state;
            this.setState({isSubmitting: true});
            if(this.validate()){
                if(!isEditable) {
                    createCard({number, expiry, cvc})
                    .then(() => {
                        this.loadCards();
                        this.setState({
                            isForm: false,
                            isSubmitting: false,
                        });
                        if(this.captchaCard) {
                            console.log("Started, Just a second...");
                            this.captchaCard.reset();
                        }
                    }).catch(({response: {data}}) => {
                        if(this.captchaCard) {
                            console.log("Started, Just a second...");
                            this.captchaCard.reset();
                        }
                        this.setState({
                            isSubmitting: false
                        });
                        if(data.errorCode === 27) {
                            return toast.error(messages.RECAPTCHA_ERROR);
                        }
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                    });
                }else {
                    updateCard(selectedCard.id, {number, expiry, cvc})
                    .then(({result: {data}}) => {
                        this.loadCards();
                        localStorage.setItem(constant.PAYMENT_METHOD, JSON.stringify(data.card));
                        this.setState({
                            selectedCard: data.card,
                            isForm: false,
                            isSubmitting: false
                        });
                        if(this.captchaCard) {
                            console.log("Started, Just a second...");
                            this.captchaCard.reset();
                        }
                    }).catch(({response: {data}}) => {
                        if(this.captchaCard) {
                            console.log("Started, Just a second...");
                            this.captchaCard.reset();
                        }
                        this.setState({
                            isSubmitting: false
                        });
                        if(data.errorCode === 27) {
                            return toast.error(messages.RECAPTCHA_ERROR);
                        }
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                    });
                }
            }
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

    handleBankInputChange = ({target: {id, value}}) => {
        this.setState({[id]: value});
    }

    handleBankSubmit(params) {
        const {createBankAccount} = this.props;
        createBankAccount(params).then(({result: {data}}) => {
            this.loadBankAccounts();
            this.checkVerified();
            this.setState({isOpen: false})
        }).catch(({ response: { data } }) => {
            if(data.errorCode === 27) {
                return toast.error(messages.RECAPTCHA_ERROR);
            }
            return toast.error(data.message);
            
        });
    }

    handleEdit = (ev, item) => {
        ev.stopPropagation();

        this.setState({
            isForm: true,
            number: '',
            cvc: '',
            isEditable: true,
            selectedCard: item,
            expiry: item.exp_month + "/" + (""+item.exp_year).substring(2)
        });
    }

    handleDelete = (ev, item) => {
        ev.stopPropagation();

        if(ev.target.id === 'card_delete')
            this.setState({
                isConfirmOpen: true,
                isCardDelete: true,
                selectedCard: item
            });
        else if (ev.target.id === 'bank_delete')
            this.setState({
                isConfirmOpen: true,
                isCardDelete: false,
                selectedBank: item
            });
    }

    selectCard = (ev, card) => {
        ev.preventDefault();
        localStorage.setItem(constant.PAYMENT_METHOD, JSON.stringify(card));
        this.setState({selectedCard: card});
    }

    handleOK = () => {
        const { selectedCard, card_lists, selectedBank, isCardDelete, bank_list } = this.state;
        const { deleteCard, deleteBank } = this.props;
        if(isCardDelete) {
            deleteCard(selectedCard.id)
            .then(() => {
                this.setState({
                    card_lists: card_lists.filter(el=>el.id !== selectedCard.id),
                    isConfirmOpen: false,
                    selectedCard: null
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        } else {
            deleteBank(selectedBank.id)
            .then(() => {
                this.setState({
                    bank_list: bank_list.filter(el=>el.id !== selectedBank.id),
                    isConfirmOpen: false,
                    selectedBank: null
                });
            }).catch(({response: {data}}) => {
                toast.error(data.message);
            });
        }
    }

    setDefaultBank = (bank) => {
        const { updateBank } = this.props;
        const params = JSON.stringify({ default_for_currency: true });

        if (!bank.default_for_currency) {
            updateBank(bank.id, { params })
            .then(() => {
                this.loadBankAccounts();
            }).catch(({response: {data}}) => {
                toast.error(data.message);
            });
        }
    };

    renderPaymentFrom() {
        const { number, expiry, cvc, focus, issuer, isSubmitting } = this.state;

        return (
            <div className="payment-form">
                <div className="card">
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
                <div className="footer row mt-5">
                    {/* <div className="col-xl-6 col-md-12 col-sm-12 mb-3 d-flex flex-column align-items-center">
                        <ReCAPTCHA
                            className="recaptcha"
                            ref={(el) => {this.captchaCard = el;}}
                            size="normal"
                            type="image"
                            sitekey={process.env.RECAPTCHA_SITE_KEY}
                            onChange={this.verifyCallback}
                        />
                    </div> */}
                    <div className="col-xl-3 col-md-6 col-sm-6">
                        <button className="btn btn-outline-success mr-3" id="cancel_card_but" onClick={this.handleClick}>Cancel</button>
                    </div>
                    <div className="col-xl-3 col-md-6 col-sm-6">
                        <button className="btn btn-success" id="add_card_but" onClick={this.handleClick} disabled={isSubmitting}>
                            {isSubmitting ? <i className="fa fa-spin fa-circle-o-notch" /> : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    renderPaymentList() {
        const {card_lists, bank_list, selectedCard, isLoadingBanks, isLoadingCards, verificationStatus} = this.state;
        return (
            <div className="row">
                <div className="col-md-12 col-lg-6">
                    <div className="payments-list">
                        <div className="header">
                            <div className="title">Make payments</div>
                            <button className="btn btn-outline-success" id="show_card_but" onClick={this.handleClick}>Add a Card</button>
                        </div>
                        {isLoadingCards?<Loader></Loader>:
                            card_lists&&card_lists.map((item, key) => {

                                let cardIcon;
                                if (item.card.brand == 'visa') {
                                    cardIcon = '/static/images/icons/icon-card.svg';
                                } else if (item.card.brand == 'mastercard') {
                                    cardIcon = '/static/images/icons/icon-master-card.svg';
                                } else {
                                    cardIcon = '/static/images/icons/icon-credit-card-alt.svg';
                                }

                                const cardBrand = item.card.brand.charAt(0).toUpperCase() + item.card.brand.slice(1);

                                return (
                                    <div className={"card payment-item" + (selectedCard && selectedCard.id === item.id?" selected":"")} key={key} onClick={(e) => this.selectCard(e, item)}>
                                        <img className="card-icon" src={cardIcon}></img>
                                        <div className="payment-detail">{cardBrand + " ending in " + item.card.last4}</div>
                                        <div className="action">
                                            {/*<img className="card-edit" src="/static/images/icons/icon-edit-gray.svg" onClick={(ev) => this.handleEdit(ev, item)}></img>*/}
                                            <img className="card-edit" src="/static/images/icons/icon-delete-gray.svg" id="card_delete" onClick={(ev) => this.handleDelete(ev, item)}></img>
                                        </div>
                                    </div>
                                )
                            })
                        }
                        {!card_lists || card_lists.length === 0?"No Card List":null}
                    </div>
                </div>
                <div className="col-md-12 col-lg-6">
                    {bank_list && bank_list.length && verificationStatus != 'active'? 
                    <div className="payments-list">
                        <div className="header">
                            <div style={{color: "red"}} className="title">Verify Your Identify</div>
                            <button className="btn btn-outline-success" id="verify-but" onClick={this.verifyAccount}>Verify</button>
                        </div>
                        <p>You must verify your identity with our payment gateway provider Stripe before you can receive funds into your bank account (e.g. by accepting an SOS job)</p>
                    </div> : null}
                    <div className="payments-list">
                        <div className="header">
                            <div className="title">Receive payments</div>
                            <button className="btn btn-outline-success" id="add-bank-but" onClick={this.handleClick}>Add a Bank</button>
                        </div>
                        {isLoadingBanks ?<Loader></Loader>:
                            bank_list&&bank_list.map((item, key) => {
                                return (
                                    <div className={item.default_for_currency? "card payment-item selected" : "card payment-item"} onClick={() => this.setDefaultBank(item)}>
                                        <div className="payment-detail" key={key}>{item.bank_name}</div>
                                        <div className="action">
                                            <img className="card-edit" src="/static/images/icons/icon-delete-gray.svg" id="bank_delete" onClick={(ev) => this.handleDelete(ev, item)}></img>
                                        </div>
                                    </div>
                                )
                            })
                        }
                        {!bank_list || bank_list.length === 0?"No Bank Account":null}
                    </div>
                </div>
                
            </div>
        )
    }

    render () {
        const {isForm, isOpen, isConfirmOpen, isCardDelete} = this.state;
        const title = isCardDelete?"Delete Card":"Delete Bank";
        const description = isCardDelete?"Do  you want to delete this card":"Do you want to delete this bank";
        return (
            <React.Fragment>
                <ConfirmDialog isOpen={isConfirmOpen} title={title} description={description} ok="Yes" cancel="No" onOk={this.handleOK} onCancel={() => this.setState({isConfirmOpen: false})}></ConfirmDialog>
                <div className="page-content">
                    <div className="container-fluid d-flex justify-content-center">
                        {isForm?this.renderPaymentFrom():this.renderPaymentList()}
                        <AddBank isOpen={isOpen} onCreate={this.handleBankSubmit} handleClose={() => this.setState({isOpen: false})}/>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

PaymentMethod.propTypes = {
    isLoadingCards: PropTypes.bool.isRequired,
    isLoadingBanks: PropTypes.bool.isRequired,
    banks: PropTypes.array.isRequired,
    cards: PropTypes.array.isRequired,
    getAllBankAccounts: PropTypes.func.isRequired,
    getCards: PropTypes.func.isRequired,
    createBankAccount: PropTypes.func.isRequired,
    createCard: PropTypes.func.isRequired,
    updateCard: PropTypes.func.isRequired,
    deleteCard: PropTypes.func.isRequired,
    deleteBank: PropTypes.func.isRequired,
    updateBank: PropTypes.func.isRequired,
    verifyUserAccount: PropTypes.func.isRequired,
    checkAccountVerified: PropTypes.func.isRequired
};

export default connect(
    null,
    { ...actions.payments }
)(PaymentMethod);
