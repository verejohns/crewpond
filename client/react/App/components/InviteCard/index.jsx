import React, { Component } from "react";
import PropTypes from "prop-types";
import {OfferForm, ConfirmDialog} from "../";
import { Modal, ModalBody } from "reactstrap";
import { toast } from 'react-toastify';

import { messages } from '../../../../../utils';

class InviteCard extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            isModalOpened: false,
            inviteConfirmed: false,
            declineInviteId: null,
            isConfirmModal: false
        };
    }

    openModal = (ev) => {
        ev.stopPropagation();

        this.setState({
            isModalOpened: true
        });
    };

    declineInvite = () => {
        const { data, updateInvite } = this.props;
        updateInvite(false, data.id)
        this.setState({
            isConfirmModal: false,
            declineInviteId: null,
        });
    }

    showDeclineConfirm =(ev) => {
        ev.stopPropagation();
        const {data} = this.props;
        this.setState({
            declineInviteId: data.id,
            isConfirmModal: true
        })
    }

    closeConfirmModal = () => {
        this.setState({
            declineInviteId: null,
            isConfirmModal: false
        })
    }

    closeModal = () => {
        this.setState({
            isModalOpened: false
        });
    };

    afterSendOffer = (success) => {
        const { data, updateInvite } = this.props;
        if(success){
            updateInvite(true, data.id)

            this.setState({
                isModalOpened: false,
                inviteConfirmed: true
            });
        }
    };

    renderModal = () => {
        const { data, history } = this.props;
        const { isModalOpened } = this.state;

        return (
            <Modal isOpen={isModalOpened} className="offer-dialog" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={this.closeModal}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Send Offer</h5>

                    <OfferForm
                        history={history}
                        jobId={data.job.id}
                        invite={data}
                        onSubmit={this.afterSendOffer}
                    />
                </ModalBody>
            </Modal>
        );
    };

    render() {
        const { data, onClick, selected } = this.props;
        const { isConfirmModal, inviteConfirmed } = this.state;
        let avatar = null;
        if(data.job.avatar) 
            avatar = data.job.avatar;
        else 
            avatar = data.sender.avatar;
        return (
            <React.Fragment>
                <ConfirmDialog isOpen={isConfirmModal} description={messages.DECLINE_INVITE_CONFIRM} ok="Yes" cancel="No" onOk={this.declineInvite} onCancel={this.closeConfirmModal}/>
                <div className={`card invite-card${selected ? ' active' : ''}`} onClick={onClick}>
                    <div className="card-body">
                        <div className="left-wrapper">
                            <div className={"avatar" +( !avatar? ' no-border' : '')}>
                                <img src={avatar?avatar:"/static/images/job_avatar.png"} alt="" />
                            </div>
                        </div>
                        <div className="right-wrapper">
                            <h5 className="title">{data.job.title}</h5>
                            <div className="poster">
                                <span>{`${data.sender.first_name} ${data.sender.last_name}`}</span>
                                {data.sender.company && (
                                    <React.Fragment>
                                        <span />
                                        <span className="company">{data.sender.company}</span>
                                    </React.Fragment>
                                )}
                            </div>
                            <div className="footer">
                                <div className="item">
                                    <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                    <span>${data.job.price}{data.job.is_hourly && "/h"}</span>
                                </div>
                                <div className="item">
                                    <img src="/static/images/icons/icon-calendar-check.svg" alt="" />
                                    <span>{data.job.number_of_offers}</span>
                                </div>
                                <div className="item">
                                    <img src="/static/images/icons/icon-location-green.svg" alt="" />
                                    <span>{data.job.location ? data.job.location.place_name : 'Remote'}</span>
                                </div>
                                {inviteConfirmed === false?<div className="action">
                                    <button className="btn btn-transparent btn-sm" onClick={this.showDeclineConfirm}>Decline</button>
                                    <button className="btn btn-success btn-sm ml-2" onClick={this.openModal}>Accept</button>
                                </div>:null}
                            </div>
                        </div>
                    </div>
                    <div className="card-footer d-md-none">
                        {inviteConfirmed === false?<div className="row">
                            <div className="col-sm-4 col-6">
                                <button className="btn btn-transparent btn-block btn-sm" onClick={this.showDeclineConfirm}>Decline</button>
                            </div>
                            <div className="col-sm-4 col-6">
                                <button className="btn btn-success btn-block btn-sm" onClick={this.openModal}>Accept</button>
                            </div>
                        </div>:null}
                    </div>
                </div>
                {this.renderModal()}
            </React.Fragment>
        );
    }
}

InviteCard.defaultProps = {
    selected: false
};

InviteCard.propTypes = {
    data: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool.isRequired,
    updateInvite: PropTypes.func.isRequired,
    acceptedInvite: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default InviteCard;
