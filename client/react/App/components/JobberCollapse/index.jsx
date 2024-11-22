import React, { Component } from "react";
import { Collapse } from 'reactstrap';
import { Modal, ModalBody} from 'reactstrap';
import { Score } from '../../../components';
import { toast } from 'react-toastify';

import PropTypes from "prop-types";
import moment from 'moment';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import actions from "../../actions";
import connect from "react-redux/es/connect/connect";
import { paths, messages, constant, time } from '../../../../../utils';

class JobberCollapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse: false,
            isOpen: false,
            score: 0,
            contract_close_reason: true,         // true: completely, false, cancelled
            cancel_reason: '',
            feedback_comment: '',
            sentFeedback: null
        };

        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    handleAssign = (type, schedule) => {
        const { handleAssign, contract } = this.props;
        handleAssign(type, schedule, contract.id);
    }

    showFeedback = () => {
        this.setState({
            isOpen: true
        });
    }

    handleContractCloseReason = (id) => {
        this.setState({
            contract_close_reason: id === 'contract_completed'?true:false
        });
    }

    handleSendFeedback = (ev) => {
        ev.preventDefault();
        const {contract, createFeedback} = this.props;
        const {contract_close_reason, cancel_reason, feedback_comment, score} = this.state;

        let params = {};
        params.contract_id = contract.id;
        params.comment = feedback_comment;
        if(contract_close_reason === false) {
            params.failure_reason = cancel_reason;
        }
        params.success = contract_close_reason;
        params.score = score;
        createFeedback(params)
        .then(() => {
            this.setState({
                isOpen: false,
                sentFeedback: score
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
            this.setState({isOpen: false});
        });
    }

    handleInputChange = ({target: {id, value}}) => {
        this.setState({
            [id]: value
        });
    }

    handleRate = (score) => {
        this.setState({score});
    }

    renderFeedback() {
        const {contract} = this.props;
        const {isOpen, contract_close_reason, score, cancel_reason, feedback_comment} = this.state;
        TimeAgo.addLocale(en)
        const timeAgo = new TimeAgo('en-US');
        return (
            <Modal isOpen={isOpen} className="feedback-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isOpen: false})}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Send Feedback</h5>
                    <div className="contract-row">
                        <h5>{contract.job.title}</h5>
                        <div className="jobber-info">
                            <div className={"avatar" + (contract.jobber.avatar?"":" no-border")}>
                                <img src={contract.jobber.avatar?contract.jobber.avatar:"/static/images/avatar.png"} alt=""/>
                            </div>
                            <div className="left-wrapper">
                                <div className="name">{contract.jobber.first_name + " " + contract.jobber.last_name}</div>
                                <div className="row">
                                    <div className="col-6">
                                        <div className="offer-price">
                                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                            <span>{"$" + contract.price}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="due-date">
                                            <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                            <span>{contract.due_date?moment(contract.due_date).format("DD/MM/YYYY"):"-"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="schedule-row">
                            <span>{"Closed"}</span>
                            <div className="schedule-due">
                                <div className="row">
                                    <div className="col-6">
                                        <span>{"Started at"}</span>
                                    </div>
                                    <div className="col-16">
                                        <span>{timeAgo.format(moment(contract.createdAt).toDate())}</span>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <span>{"Closed at"}</span>
                                    </div>
                                    <div className="col-16">
                                        <span>{timeAgo.format(moment(contract.closed_at).toDate())}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={this.handleSendFeedback}>
                        <h5>Reason or ending project</h5>
                        <div className="contract-close-reason" id="contract_completed" onClick={() => this.handleContractCloseReason("contract_completed")}>
                            <div>Job completed successfully</div>
                            {contract_close_reason?<span className="fa fa-check"></span>:null}
                        </div>
                        <div className="contract-close-reason" id="contract_cancelled" onClick={() => this.handleContractCloseReason("contract_cancelled")}>
                            <div>Job cancelled for (if the user, NOT YOU! has cancelled)</div>
                            {!contract_close_reason?<span className="fa fa-check"></span>:null}
                        </div>
                        {!contract_close_reason?<input type="text" className="form-control dark-input mt-3" id="cancel_reason" value={cancel_reason}
                             onChange={this.handleInputChange}></input>:null}
                        <div className="row mt-3">
                            <div className="col-lg-6 col-md-12"><h5>Feedback to opponent</h5></div>
                            <div className="col-lg-6 col-md-12">
                                <Score  score={score} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"}
                                        size={"25px"} onConfirmRate={this.handleRate} disabled={false}/>
                            </div>
                        </div>
                        <h5>Comment:</h5>
                        <textarea className="form-control dark-input mt-3" id="feedback_comment" value={feedback_comment}
                            onChange={this.handleInputChange}></textarea>
                        <div className="footer">
                            <button className="btn btn-success">Send Feedback</button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        )
    }

    createChat = (params) => {
        const {createChat, history: {push}, getIsArchivedRoom} = this.props;
        createChat(params)
        .then(({result: {data}}) => {
            const {room} = data;
            getIsArchivedRoom({roomId: room.id})
            .then(({result: {data}}) => {
                const { isArchived } = data;
                const archivedQuery = isArchived?'&archive=true':'';
                push(`${paths.client.APP_MESSAGES}?roomId=${room.id + archivedQuery}`);
            }).catch((error) => {
                console.log(error)
                toast.error(messages.CHAT_ROOM_FAILED);
            })
        }).catch((error) => {
            console.log(error)
            toast.error(messages.CHAT_ROOM_FAILED);
        })
    }

    gotoChat(user) {

        const chat_room_title = user.first_name + " " + user.last_name;
        const user_ids = [this.authUser.id, user.id];

        this.createChat({ user_ids, type: 'direct', title: null });
    }

    renderConfirmDialog() {
        const { isConfirmOpen } = this.state;
        const { contract, handleCloseContract } = this.props;

        return (
            <Modal isOpen={isConfirmOpen} className="confirm-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={this.handleClose}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Close Contract</h5>
                    <div className="modal-description">
                    Are you sure to you want to close this contract?
                    </div>
                    <div className="footer">
                        <button className="btn btn-outline-success" onClick={this.handleClose}>No</button>
                        <button className="btn btn-success" id="close_confirm" onClick={() => handleCloseContract(contract.id)}>Yes</button>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    handleClose = () => {
        this.setState({
            isConfirmOpen: false
        });
    }

    handleConfirmOpen = () => {
        this.setState({
            isConfirmOpen: true
        });
    }

    render() {
        const { contract, allSchedules, assignSchedule, handleCloseContract, isHirerView } = this.props;
        const { collapse, sentFeedback, isConfirmModalOpen} = this.state;
        const received_feedback = contract.feedbacks.find(el=>el.to_user_id === this.authUser.id);
        const received_score = received_feedback?received_feedback.score:null;
        const sent_feedback = contract.feedbacks.find(el=>el.from_user_id === this.authUser.id);
        const sent_score = sentFeedback?sentFeedback:(sent_feedback?sent_feedback.score:null);

        TimeAgo.addLocale(en)
        const timeAgo = new TimeAgo('en-US');

        return (
            <div className="jobber-collapse">
                {this.renderFeedback()}
                {this.renderConfirmDialog()}
                <div className="jobber-info" onClick={()=>this.setState({collapse: !this.state.collapse})}>
                    <div className="jobber-row">
                        <div className={"avatar" + (!contract.jobber.avatar?" no-border":"")}>
                            <img src={contract.jobber.avatar?contract.jobber.avatar:'/static/images/avatar.png'} alt="" />
                        </div>
                        <div className="left-wrapper">
                            <div className="name">{contract.jobber.first_name + " " + contract.jobber.last_name}</div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="offer-price">
                                        <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                        <span>{"$" + contract.price }</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="hourly-rate">
                                        <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                        <span>{contract.due_date?moment(contract.due_date).format("DD/MM/YYYY"):"-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="right-wrapper">
                            <div className="action">
                                {contract.jobber_id !== this.authUser.id &&<img src="/static/images/icons/icon-chat-gray.svg" alt="" onClick={() => this.gotoChat(contract.jobber)}/>}
                                {/*<img src="/static/images/icons/icon-profile-gray.svg" alt=""/>*/}
                                {isHirerView === true && <img className="collapse-action" src={this.state.collapse?"/static/images/icons/icon-arrow-up.svg":"/static/images/icons/icon-arrow-down.svg"} alt=""/> }
                            </div>
                        </div>
                    </div>
                    <div className="schedule-row">
                        <div className="left-wrapper">
                            <div className="contract-status">
                                <span>{contract.closed_at?"Closed":"Opened"}</span>
                                <div className="contract-time">
                                    <span>{"Started at " + timeAgo.format(moment(contract.createdAt).toDate())}</span>
                                    {contract.closed_at?<span>{"Closed at " + timeAgo.format(moment(contract.closed_at).toDate())}</span>:null}
                                </div>
                            </div>
                        </div>
                        <div className="right-wrapper">
                            {contract.closed_at?null:<button className="btn btn-success btn-sm" onClick={() => this.handleConfirmOpen()}>Close Contract</button>}
                        </div>
                    </div>
                    {isHirerView === true && contract.closed_at?<div className="feedback-row">
                        <div className="left-wrapper">
                            <h4>Feedback</h4>
                            <div className="feedback">
                                {received_score?<Score score={received_score} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"} size={"25px"} />:<span>No feedback received</span>}
                            </div>
                            <div className="feedback">
                                {sent_score?<Score score={sent_score} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"} size={"25px"} />:null}
                                {sent_score?("feedback provided to " + contract.jobber.first_name + " " + contract.jobber.last_name):null}
                            </div>
                        </div>
                        <div className="right-wrapper">
                            {!sent_score?<button className="btn btn-success btn-sm" onClick={this.showFeedback}>Send Feedback</button>:null}
                        </div>
                    </div>:null}
                </div>
                {isHirerView === true?<Collapse isOpen={collapse || assignSchedule}>
                    {allSchedules.map((item, key) => {
                        let assignedSchedule = contract?.schedule_ids?.find(el=>el == item.id.toString());

                        let min_time = item.time_field[0].from;
                        let max_time = item.time_field[0].to;
                        for(let i = 1; i < item.time_field.length; i += 1) {
                            if(time.compareDate(item.time_field[i].from, min_time)){
                                min_time = item.time_field[i].from;
                            }
                            if(time.compareDate(max_time, item.time_field[i].to)){
                                max_time = item.time_field[i].to;
                            }
                        }
                        return (
                            (assignedSchedule || assignSchedule || collapse)?<div className="schedule-info" key={key}>
                                <div className="indicator">
                                    <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                                </div>
                                <div className="left-wrapper">
                                    <div className="name">{item.name}</div>
                                    <span>{moment(min_time).format("DD/MM/YYYY") + "~" + moment(max_time).format("DD/MM/YYYY")}</span>
                                </div>
                                <div className="right-wrapper">
                                    {assignedSchedule?
                                        <button className="btn btn-success btn-sm unassign-but mt-3" onClick={() => this.handleAssign("unassign_schedule", item)}>Unassign</button>:
                                        <button className="btn btn-success btn-sm unassign-but mt-3" onClick={() => this.handleAssign("assign_schedule", item)}>Assign</button>}
                                </div>
                            </div>:null
                        )
                    })}
                </Collapse>:null}
            </div>
        );
    }
}

JobberCollapse.defaultProps = {
};

JobberCollapse.propTypes = {
    contract: PropTypes.object.isRequired,
    isHirerView: PropTypes.bool.isRequired,
    createFeedback: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
    getChatRoomByJobber: PropTypes.func
};

export default connect(
    null,
    {
        ...actions.feedbacks,
        ...actions.chats
    }
)(JobberCollapse);
