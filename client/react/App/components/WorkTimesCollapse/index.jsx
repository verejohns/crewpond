import React, { Component } from "react";
import { Collapse } from 'reactstrap';

import PropTypes from "prop-types";
import moment from 'moment';
import { time, paths } from '../../../../../utils';

class WorkTimesCollapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse: false
        };
    }

    handleEdit = () => {
        const { history: {push}, worktime } = this.props;
        push(`${paths.client.APP_WOKRING_HOURS}?contractId=${worktime.contract_id}&workHourId=${worktime.id}&scheduleId=${worktime.schedule_id}`);
    }

    render() {
        const { worktime } = this.props;
        const { collapse } = this.state;
        const workhours = moment.duration(moment(worktime.to).diff(moment(worktime.from)));
        let breakhours = 0;
        for(let i = 0; i < worktime.break_times.length; i += 1) {
            breakhours += moment.duration(moment(worktime.break_times[i].to).diff(moment(worktime.break_times[i].from)));
        }
        const is_next_day = time.inDates(moment(worktime.from).toDate(), moment(worktime.to).toDate());
        return (
            <div className="schedule-collapse">
                <div className="schedule-info" onClick={()=>this.setState({collapse: !this.state.collapse})}>
                    <div className="indicator">
                        <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                    </div>
                    <div className="name">
                        <span>{worktime.schedule.name}</span>
                        <span className="due-date">{moment(worktime.schedule.time_field[0].from).format('DD MMM YY')} - {moment(worktime.schedule.time_field[worktime.schedule.time_field.length-1].to).format('DD MMM YY')}</span>
                        <span>{"Total Works: " + time.hhmmss((workhours - breakhours)/1000, false)}</span>
                    </div>
                    <div className="schedule-collapse-action">
                        <button className="btn btn-outline-success btn-sm">View</button>
                        <img src={this.state.collapse?"/static/images/icons/icon-arrow-up.svg":"/static/images/icons/icon-arrow-down.svg"} alt=""/>
                    </div>
                </div>
                <Collapse isOpen={collapse}>
                    <div className="row pl-5 pr-5 pt-3 pb-3">
                        <div className="col-5">
                            <span>{moment(worktime.from).format('DD MMM YY')}</span>
                            <span className="due-date">{moment(worktime.from).format('HH:MM') + " - " + moment(worktime.to).format('HH:MM') + (is_next_day > 0?"(Next day)":"")}</span>
                        </div>
                        <div className="col-5 d-flex flex-column">
                            <span>{"Work:  " + time.hhmmss((workhours)/1000, false)}</span>
                            <span>{breakhours > 0?("Break: " + time.hhmmss((breakhours)/1000, false)):null}</span>
                        </div>
                        <div className="col-2">
                            <button className="btn btn-success" onClick={this.handleEdit}>Edit</button>
                        </div>
                    </div>
                </Collapse>
            </div>   
        );
    }
}

WorkTimesCollapse.propTypes = {
    worktime: PropTypes.object.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
      }).isRequired,
};

export default WorkTimesCollapse;

