import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import actions from "../../actions";
import { Modal, ModalBody} from 'reactstrap';
import { paths, constant } from "../../../../../utils";

import moment from 'moment';

class JobModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT))
        }
    }

    handleOk = () => {
        const {onOk, isSubmitting} = this.props;
        if(!isSubmitting) {
            onOk();
        }
    }

    getDateOfSchedule = (time) => {
        if(time && time.schedule.time_field.length > 0) 
            return moment(time.schedule.time_field[0].from).format('DD/MM/YYYY');
        return '';
    }

    handleClick = (ev) => {
        const { history: {push}, job, contract} = this.props;
        // push(paths.build(paths.client.APP_EDIT_JOB, id));
        if(ev.target.id === 'job_edit_action')
            push(paths.build(paths.client.APP_EDIT_JOB, job.id));
        else if(ev.target.id === 'profile_view_action')
            push(paths.build(paths.client.APP_JOBBER_PROFILE, job.user.id));
        else if(ev.target.id === 'view_contract_action') 
            push(`${paths.client.APP_CONTRACTS}?contractId=${contract.id}&jobId=${job.id}`);
    }

    gotoChat = () => {
        const { history: {push}, job, createChat, getIsArchivedRoom} = this.props;
        const { authUser } = this.state;
        const user_ids = [job.owner_id, authUser.id];
        // const title = job.title;
        const job_id = job.id;
        const type = "job";
        createChat({user_ids, title:null, job_id, type})
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

    render() {
        const { isOpen, job, time, contract, onClose } = this.props;
        const { authUser } = this.state;
        const schedule_date = this.getDateOfSchedule(time);
        return (
            <Modal isOpen={isOpen} className="job-info-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <div className="job-schedule-date">{schedule_date}</div>
                    {job && (job.owner_id === authUser.id)?
                    <div className="job-header-action">
                        <img src="/static/images/icons/icon-edit-white.svg" id="job_edit_action" alt="" onClick={this.handleClick}></img>
                    </div>:null}
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={onClose}/>
                </div>

                <ModalBody>
                    <div className="schedule-title">
                        <div className="indicator">
                            <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                        </div>
                        {time?time.schedule.name:""}
                    </div>
                    <div className="jobber-row">
                        <div className="avatar">
                            <img src={job&&job.user.avatar?job.user.avatar:"/static/images/avatar.png"} id="profile_view_action" onClick={this.handleClick}></img>
                        </div>
                        <div className="jobber-description">
                            <div className="jobber-name">{job&&(job.user.first_name + " " + job.user.last_name)}</div>
                            <div className="jobber-company">{job&&job.user.company}</div>
                        </div>
                        {job && (job.owner_id !== authUser.id)?
                        <div className="action ml-auto">
                            <img src="/static/images/icons/icon-chat-gray.svg" onClick={this.gotoChat}></img>
                        </div>:null}
                    </div>
                    <div className="border-line"/>
                    <div className="job-info">
                        <div className="job-title">{job&&job.title}</div>
                        <div className="job-content">
                            <div className="label">Description: </div>
                            <div className="description">{job&&job.description}</div>
                        </div>
                    </div>
                    {/* <div className="border-line"/>
                    <div className="job-address">
                        <img src="/static/images/icons/icon-location-green.svg" alt="" />
                        <span>{job&&job.address?job.addres:"Remote"}</span>
                    </div> */}
                    {contract?
                    <div className="footer">
                        <button className="btn btn-success" id="view_contract_action" onClick={this.handleClick}>View Contract</button>
                    </div>:null}
                </ModalBody>
            </Modal>
        );
    }
}

JobModal.defaultProps = {
    isOpen: false,
};

JobModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    createChat: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func.isRequired,
    job: PropTypes.object,
    contract: PropTypes.object,
    time: PropTypes.object,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    null,
    { 
        ...actions.chats,
    }
)(JobModal);

