import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from 'moment';
import { constant } from "../../../../../utils";

class InvoiceCard extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            isModalOpened: false,
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT))
        };
    }

    openModal = (ev) => {
        ev.stopPropagation();

        this.setState({
            isModalOpened: true
        });
    };

    closeModal = () => {
        this.setState({
            isModalOpened: false
        });
    };

    afterSendOffer = () => {

    };

    render() {
        const { data, onClick, selected } = this.props;
        const { authUser } = this.state;

        return (
            <React.Fragment>
                <div className={`card invoice-card${selected ? ' active' : ''}`} onClick={onClick}>
                    <div className="card-body">
                        <div className="content-wrapper">
                            {authUser.id !== data.sender_id &&
                                <div className={"avatar" + (!data.sender_avatar? ' no-border' : '')}>
                                    <img src={data.sender_avatar ? data.sender_avatar : "/static/images/avatar.png"} />
                                    {!data.is_read && <div className="badge-count"/>}
                                </div>
                            }
                            <div className={`invoice-content ${authUser.id !== data.sender_id ? 'received-invoice' : 'sent-invoice'}`}>
                                <div className="header">{moment(data.invoice_date).format('DD/MM/YYYY')}</div>
                                <div className="content">
                                    <div className="title">Sent Invoices - Timesheet  {data.invoice_no && data.invoice_no}</div>
                                    <span>{data.job_title}</span>
                                    {authUser.id !== data.sender_id &&
                                    <>
                                        <div className="sender-name">
                                            <span>Received From: </span>
                                            <span>{data.sender_username}</span>
                                        </div>
                                        <div className="company">
                                            <span>Company: </span>
                                            <span>{data.sender_company}</span>
                                        </div>
                                    </>
                                    }
                                </div>
                                <div className="footer">
                                    <div className="due-date">
                                        <span>{moment(data.invoice_date).format('DD/MM/YYYY')} - {moment(data.invoice_date).format('DD/MM/YYYY')}</span>
                                    </div>
                                    {/* <div className="item">
                                        {(data.sender_type === "full_time_worker" || data.sender_type === "casual_worker") ?
                                            <img src="/static/images/icons/icon-clock-green.svg" alt="" /> :
                                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                        }
                                        <span>{(data.sender_type === "full_time_worker" || data.sender_type === "casual_worker") ? `${Math.floor(data.total_worktime_seconds / 3600)}Hours` : `$${data.total_price.toFixed(2)}`}</span>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

InvoiceCard.defaultProps = {
    selected: false
};

InvoiceCard.propTypes = {
    data: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool.isRequired,
};

export default InvoiceCard;
