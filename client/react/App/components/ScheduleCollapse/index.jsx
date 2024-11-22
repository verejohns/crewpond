import React, { Component } from "react";
import { Collapse } from 'reactstrap';

import PropTypes from "prop-types";
import moment from 'moment';

class ScheduleCollapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse: false
        };
    }

    handleAssign = (type, contractId) => {
        const { schedule, handleAssign } = this.props;
        handleAssign(type, schedule, contractId);
    }

    render() {
        const { schedule, assignSchedule, contracts, isHirerView } = this.props;
        const { collapse } = this.state;
        const time_field = schedule.time_field;

        return (
            <div className="schedule-collapse">
                <div className="schedule-info" onClick={()=>this.setState({collapse: !this.state.collapse})}>
                    <div className="indicator">
                        <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                    </div>
                    <div className="name">
                        <span>{schedule.name}</span>
                        <span className="due-date">{moment(time_field[0].from).format('DD/MM/YYYY')} - {moment(time_field[time_field.length-1].to).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className="schedule-collapse-action">
                        <button className="btn btn-outline-success btn-sm">View</button>
                        <img src={this.state.collapse?"/static/images/icons/icon-arrow-up.svg":"/static/images/icons/icon-arrow-down.svg"} alt=""/>
                    </div>
                </div>
                <Collapse isOpen={collapse}>
                    {contracts.length > 0? contracts.map((contractItem) => {
                        let assignedSchedule = contractItem.schedules.find(el=>el.id == schedule.id);
                        return (
                            <>
                                {assignedSchedule || assignSchedule || collapse? 
                                <div className="jobber-row">
                                    <div className={"avatar" + (contractItem.jobber.avatar?"":" no-border")}>
                                        <img src={contractItem.jobber.avatar?contractItem.jobber.avatar:"/static/images/avatar.png"} alt=""/>
                                    </div>
                                    <div className="left-wrapper">
                                        <div className="name">{contractItem.jobber.first_name + " " + contractItem.jobber.last_name}</div>
                                        <div className="row">
                                            <div className="col-lg-4 col-md-12 mb-md-3">
                                                <div className="offer-price mt-3">
                                                    <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                                    <span>{"$" + contractItem.price}</span>
                                                </div>
                                            </div>
                                            <div className="col-lg-8 col-md-12 mt-3">
                                                <div className="hourly-rate">
                                                    <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                                    <span>{moment(contractItem.dueDate).format('DD/MM/YYYY')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isHirerView && 
                                    <div className="right-wrapper">
                                        {assignedSchedule?
                                            <button className="btn btn-success btn-sm unassign-but" id="unassign_schedule" onClick={() => this.handleAssign("unassign_schedule", contractItem.id)}>Unassign</button>:
                                            <button className="btn btn-success btn-sm unassign-but" id="assign_schedule" onClick={() => this.handleAssign("assign_schedule", contractItem.id)}>Assign</button>}
                                    </div>}
                                </div>
                                : null}
                            </>
                        )
                    }) :
                    <div className="jobber-row">No Jobbers</div>
                    }
                </Collapse>
            </div>   
        );
    }
}

ScheduleCollapse.defaultProps = {
};

ScheduleCollapse.propTypes = {
    schedule: PropTypes.object.isRequired,
    contracts: PropTypes.object.isRequired,
    assignSchedule: PropTypes.bool.isRequired,
    isHirerView: PropTypes.bool.isRequired
};

export default ScheduleCollapse;

