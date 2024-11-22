import React, { Component } from "react";
import ScheduleItem from "../ScheduleItem";
import { Modal, ModalBody} from 'reactstrap';
import { toast } from 'react-toastify';

import connect from "react-redux/es/connect/connect";
import actions from "../../actions";
import PropTypes from "prop-types";
import { messages, time } from '../../../../../utils';
import 'react-tabs/style/react-tabs.css';

class ScheduleDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schedules: [],
            scheduleSelected: []
        };

        this.limit = 10;
        this.handleSendInvite = this.handleSendInvite.bind(this);
    }
    componentDidMount() {
        const { jobId, getJobById } = this.props;
        getJobById(jobId)
        .then(({result: {data}}) => {
            if(data.job.schedules){
                this.setState({
                    schedules: data.job.schedules
                });
            }
        });
    }

    handleSendInvite() {
        const {schedules, scheduleSelected} = this.state;
        const {sendInvite} = this.props;
        if((schedules.length > 0 && scheduleSelected.length > 0) || schedules.length === 0)
            sendInvite(scheduleSelected);
        else
            toast.error(messages.INVITE_MUST_SELECT_SCHEDULE)
    }

    handleScheduleClick = (id) => {
        let { scheduleSelected } = this.state;
        if (scheduleSelected.includes(id)) {
            scheduleSelected = scheduleSelected.filter(value => {
                return value !== id
            });
        } else {
            scheduleSelected.push(id);
        }
        this.setState({scheduleSelected});
    };

    handleSelectAll = () => {
        const { schedules, scheduleSelected } = this.state;
        if(scheduleSelected.length === schedules.length)
            this.setState({scheduleSelected: []});
        else{
            let schedule_ids = [];
            for(let i = 0; i < schedules.length; i += 1){
                schedule_ids.push(schedules[i].id);
            }
            this.setState({scheduleSelected: schedule_ids});
        }
    }

    render() {
        const { handleClose, isOpen, history } = this.props;
        const { schedules, scheduleSelected } = this.state;
        const isSelectedAll = (schedules.length === scheduleSelected.length)?true:false;

        return (
            <Modal isOpen={isOpen} className="schedule-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleClose}/>
                </div>

                <ModalBody>
                    <div className="modal-title">
                        <h5 className="text-center">Select Schedules</h5>
                        <div className="text-right">
                            <span className="select-all-schedule" onClick={this.handleSelectAll}>{isSelectedAll?"Unselect all":"Select all"}</span>
                        </div>
                    </div>
                    
                    <div className="schedule-list">
                        <div className="row">
                            {schedules.map((item, key) => {
                                console.log(item)
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

                                const selected = scheduleSelected.find(el=>el === item.id)?true:false
                                return (
                                    <ScheduleItem
                                        history={history}
                                        key={key}
                                        type={2}
                                        data={item}
                                        selected={selected}
                                        onClick={this.handleScheduleClick}
                                    />
                                )
                            })}
                        </div>
                    </div>
                    <div className="footer">
                        <button className="btn btn-success" onClick={this.handleSendInvite}>Send</button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}

ScheduleDialog.defaultProps = {
    isOpen: false,
    schedules: []
};

ScheduleDialog.propTypes = {
    schedules: PropTypes.array,
    isOpen: PropTypes.bool.isRequired,
    getJobById: PropTypes.func,
    sendInvite: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired
};

export default connect(
    null,
    { 
        ...actions.jobs,
    }
)(ScheduleDialog);
