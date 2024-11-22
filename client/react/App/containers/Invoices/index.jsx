import React, { Component } from "react";
import PropTypes from "prop-types";
import {toast} from "react-toastify";
import connect from 'react-redux/es/connect/connect';

import {Loader, InvoiceCard, Slider, InvoiceDetail} from "../../components";
import { constant, messages } from "../../../../../utils";
import selectors from './selectors';
import actions from '../../actions';

class Invoices extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            invoices: [],
            invoiceSelected: null,
            is_received: false,
            isLoading: false,
            badgeCount: {}
        };
        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    componentDidMount() {
        const { getBadgeCount } = this.props;

        this.loadInvoices(true);

        getBadgeCount();
    }

    componentWillUnmount() {
        if (this.hasScrollListener) {
            window.removeEventListener("scroll", this.loadMore);
            this.hasScrollListener = false;
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.badgeCount.invoice_count !== prevProps.badgeCount.invoice_count && this.props.badgeCount) {
            this.getInvoicesByType(false);
        }
    }

    loadInvoices = (isSent) => {
        const { getSentInvoices, getReceivedInvoices } = this.props;
        this.setState({isLoading: true, is_received: !isSent});
        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
        };
        if (this.lastValue)
            params.lastValue = this.lastValue;

        if(isSent){
            getSentInvoices(params).then(({ result: { data } }) => {
                let { invoices } = this.state;
                invoices = invoices.concat(data.invoices);
                this.lastValue = data.lastValue;
                this.setState({ invoices, isLoading: false }, () => {
                    if (data.invoices.length > 0 && data.invoices.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });    
        }else {
            getReceivedInvoices(params).then(({ result: { data } }) => {
                let { invoices } = this.state;
                invoices = invoices.concat(data.invoices);
                this.lastValue = data.lastValue;
                this.setState({ invoices, isLoading: false }, () => {
                    if (data.invoices.length > 0 && data.invoices.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });    
        }
    };

    getInvoicesByType = (isSent) => {
        this.limit = 10;
        this.lastValue = null;
        this.setState({
            isLoading: true,
            invoices: []
        })
        this.loadInvoices(isSent);
    }
    

    loadMore = () => {
        const {isLoading, is_received} = this.state;
        if (!isLoading && window.scrollY + window.innerHeight >= document.body.clientHeight) {
            this.loadInvoices(!is_received);
        }
    };

    selectInvoice = (id) => {
        this.setState({
            invoiceSelected: id
        })
    };

    render() {
        const {badgeCount} = this.props;
        const { isLoading, invoices, invoiceSelected } = this.state;

        let content;

        if (!isLoading && invoices.length === 0) {
            content = (
                <h3 className="text-center">
                    {messages.NO_DATA}
                </h3>
            )
        } else {
            content = (
                <div className="row">
                    {invoices.map((item, index) => {
                        return (
                            <div className="col-12 mb-3">
                                <InvoiceCard
                                    key={index}
                                    data={item}
                                    onClick={() => this.selectInvoice(item.id)}
                                    selected={item.id === invoiceSelected}
                                />
                            </div>
                        );    
                    })}
                    {isLoading ?
                        <div className="col-12 mt-5">
                            <Loader />
                        </div> : null
                    }
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className="page-header">
                    <div className="header-container">
                        <div className="page-nav">
                            <ul>
                                <li className={"switch" + (!this.state.is_received?" active":"")} onClick={() => this.getInvoicesByType(true)}>Sent</li>
                                <li className={"switch" + (this.state.is_received?" active":"")} onClick={() => this.getInvoicesByType(false)}>
                                    <span>Received</span>
                                    {badgeCount.invoice_count > 0 && <div className="badge-count invoice-received">
                                        {badgeCount.invoice_count}
                                    </div>}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="page-content">
                    <div className="container">
                        <div className="header"></div>
                        {content}
                    </div>
                </div>
                {invoiceSelected && (
                    <Slider
                        onUnmount={() => this.selectInvoice(null)}
                    >
                        <InvoiceDetail
                            id={invoiceSelected}
                        />
                    </Slider>
                )}
            </React.Fragment>
        );
    }
}

Invoices.propTypes = {
    getReceivedInvoices: PropTypes.func.isRequired,
    getSentInvoices: PropTypes.func.isRequired,
    getBadgeCount: PropTypes.func.isRequired,
    badgeCount: PropTypes.object.isRequired,
};

export default connect(
    selectors,
    { 
        ...actions.invoices,
        ...actions.settings,
        ...actions.notifications
    }
)(Invoices);
