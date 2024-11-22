import React, { Component } from "react";
import connect from "react-redux/es/connect/connect";
import moment from "moment";
import PropTypes from "prop-types";
import selectors from "./selectors";
import actions from "../../actions";
import { time } from "../../../../../utils";

import { Loader } from "../../../components";

class InvoiceDetail extends Component {
    async componentDidMount() {
        const { id, getInvoiceById, getBadgeCount } = this.props;

        await getInvoiceById(id);

        getBadgeCount();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { id, getInvoiceById } = this.props;

        if (nextProps.id !== id) {
            getInvoiceById(nextProps.id);
        }
    }

    render() {
        const { isLoading, invoice } = this.props;

        let invoiceFileName = "";

        if (invoice.invoice_no) {
            if (invoice.sender_abn) {
                invoiceFileName = invoice.sender_username + " " + invoice.sender_abn + " " + invoice.invoice_no;
            } else {
                invoiceFileName = invoice.sender_username + " " + invoice.invoice_no;
            }
        } else {
            if (invoice.sender_abn) {
                invoiceFileName = invoice.sender_username + " " + invoice.sender_abn + " " + moment().unix();
            } else {
                invoiceFileName = invoice.sender_username + " " + moment().unix();
            }
        }
        
        if (isLoading || !invoice) {
            return (
                <Loader />
            );
        }

        let totalWorkTime = 0;
        let totalBreakTime = 0;
        let totalPrice = 0;

        return (
            <div className="detail-container">
                <div className="slider-header status">
                    <div className="action">
                        <a href={invoice.download_link?invoice.download_link:"#"} download={`${invoiceFileName}.pdf`}><img className="print" src="/static/images/icons/icon-download.svg"></img></a>
                    </div>
                </div>

                <section>
                    <div className="description">Zapstars Production</div>
                </section>

                <section>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            Invoice No:
                        </div>
                        <div className="right-wrapper">
                            {invoice.invoice_no}
                        </div>
                    </div>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            Date:
                        </div>
                        <div className="right-wrapper">
                            {moment(invoice.invoice_date).format('MM/DD/YYYY')}
                        </div>
                    </div>
                    {/* <div className="invoice-row">
                        <div className="left-wrapper">
                            Date Due:
                        </div>
                        <div className="right-wrapper">
                            {moment(invoice.due_date).format('MM/DD/YYYY')}
                        </div>
                    </div> */}
                </section>
                <section>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            Contact:
                        </div>
                        <div className="right-wrapper">
                            {invoice.sender_trading_name}
                        </div>
                    </div>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            ABN:
                        </div>
                        <div className="right-wrapper">
                            {invoice.sender_abn}
                        </div>
                    </div>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            Email:
                        </div>
                        <div className="right-wrapper">
                            {invoice.sender_email}
                        </div>
                    </div>
                </section>
                <section>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            Bill To:
                        </div>
                        <div className="right-wrapper">
                            {invoice.receiver_company}
                        </div>
                    </div>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            Email:
                        </div>
                        <div className="right-wrapper">
                            {invoice.receiver_email}
                        </div>
                    </div>
                    <div className="invoice-row">
                        <div className="left-wrapper">
                            Indicators
                        </div>
                        <div className="right-wrapper">
                        </div>
                    </div>
                </section>
                <section>
                    <div className="invoice-time-sheet">
                        <div className="header">Time Sheets</div>
                        {invoice.worktimes && invoice.worktimes.map((item, key) => {
                            const to = new Date(item.to);
                            const from = new Date(item.from);
                            const diff = (to.getTime() - from.getTime()) / 1000;
                            const price = (diff/3600) * invoice.price;
                            
                            totalWorkTime += diff;
                            totalPrice += price;

                            let bDiff = 0;
                            for(let i = 0; i < item.break_times.length; i += 1) {
                                bDiff += ((new Date(item.break_times[i].to)).getTime() - (new Date(item.break_times[i].from)).getTime()) / 1000;
                            }

                            totalBreakTime += bDiff;

                            return (
                                <div className="invoice-row">
                                    <div className="row mt-3">
                                        <div className="col-4">
                                            <div className="date">{moment(item.createdAt).format('MM/DD/YYYY')}</div>
                                        </div>
                                        <div className="col-8 d-flex flex-row">
                                            <div className="left-wrapper">
                                                Work Time:
                                            </div>
                                            <div className="right-wrapper">
                                                {time.hhmmss(diff, true)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-4">
                                            <div className="price">{price.toFixed(2) + "$"}</div>
                                        </div>
                                        <div className="col-8 d-flex flex-row">
                                            <div className="left-wrapper">
                                                Break Time:
                                            </div>
                                            <div className="right-wrapper">
                                                {time.hhmmss(bDiff, true)}
                                            </div>        
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="invoice-row">
                            <div className="row mt-3">
                                <div className="col-4">
                                    <div className="date">Total</div>
                                </div>
                                <div className="col-8 d-flex flex-row">
                                    <div className="left-wrapper">
                                        Work Time:
                                    </div>
                                    <div className="right-wrapper total-value">
                                        {time.hhmmss(totalWorkTime, true)}
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-4">
                                    <div className="price total-value">{totalPrice.toFixed(2) + "$"}</div>
                                </div>
                                <div className="col-8 d-flex flex-row">
                                    <div className="left-wrapper">
                                        Break Time:
                                    </div>
                                    <div className="right-wrapper total-value">
                                        {time.hhmmss(totalBreakTime, true)}
                                    </div>        
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

InvoiceDetail.propTypes = {
    id: PropTypes.number.isRequired,
    invoice: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    getInvoiceById: PropTypes.func.isRequired
};

export default connect(
    selectors,
    {
        ...actions.invoices,
        ...actions.notifications
    }
)(InvoiceDetail);
