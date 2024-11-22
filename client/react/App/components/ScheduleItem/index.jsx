import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import actions from "../../actions";
import PropTypes from "prop-types";

import { Checkbox } from "../../components";
import { time, paths } from '../../../../../utils';
import { toast } from 'react-toastify';

class ScheduleItem extends Component {
    constructor(props) {
        super(props);
    }

    onClick = () => {
        const { data, onClick } = this.props;

        if (onClick) {
            return onClick(data.id);
        }
    };

    gotoSchedule = (ev) => {
        ev.preventDefault();
        const { data, jobId, history: {push}, isOwner } = this.props;
        if(!isOwner)
            return toast.error("You are not a owner of this job.");
        let start_date = null;
        let end_date = null;
        if(data.time_field.length > 0) {
            start_date = data.time_field[0].from;
            end_date = data.time_field[0].to;
            for(let i = 1; i < data.time_field.length; i += 1) {
                if(!time.compareDate(start_date, data.time_field[i].from)) {
                    start_date = data.time_field[i].from;
                }
                if(time.compareDate(end_date, data.time_field[i].to)) {
                    end_date = data.time_field[i].to;
                }
            }
        }

        start_date = moment(start_date).set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DDTHH:mm:ssZ');
        
        let params = `?viewMode=day&startDate=${encodeURIComponent(start_date).replace(" ", "%20")}&jobId=${jobId}`;
        push({pathname: paths.client.APP_SCHEDULE, search: params});
    }

    render() {
        const { data, type, selected, isOwner } = this.props;
        
        if (type !== 1) {
            return (
                <div className="schedule clickable" onClick={this.onClick}>
                    <Checkbox
                        className="circle transparent"
                        checked={selected}
                        disabled
                    />
                    <div className="indicator">
                        <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                    </div>
                    <div className="content">
                        <div className="top">
                            <div className="name">{data.name}</div>
                        </div>
                        {
                            data.time_field.map(time => {
                                if (moment(time['from']).format("D MMM YY") === moment(time['to']).format("D MMM YY")) {
                                    return (
                                        <div className="bottom">
                                            <div className="date">
                                                {moment(time['from']).format("D MMM YY")}
                                            </div>
                                            <div className="time">
                                                {moment(time['from']).format("hh:mm A")} - {moment(time['to']).format("hh:mm A")}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <>
                                            <div className="bottom">
                                                <div className="date">
                                                    {moment(time['from']).format("D MMM YY")}
                                                </div>
                                                <div className="time">
                                                    {moment(time['from']).format("hh:mm A")} - {'00:00 AM'}
                                                </div>
                                            </div>
                                            <div className="bottom">
                                                <div className="date">
                                                    {moment(time['to']).format("D MMM YY")}
                                                </div>
                                                <div className="time">
                                                    {'00:00 AM'} - {moment(time['to']).format("hh:mm A")}
                                                </div>
                                            </div>
                                        </>
                                    );
                                }
                            })
                        }
                    </div>
                </div>
            );
        }

        return (
            <div className="schedule">
                <div className="indicator">
                    <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                </div>
                <div className="content">
                    <div className="top">
                        <div className="name">{data.name}</div>
                        {isOwner?<div className="link-green" onClick={this.gotoSchedule}>View Details</div>:null}
                    </div>
                    {
                        data.time_field.map(time => {
                            if (moment(time['from']).format("D MMM YY") === moment(time['to']).format("D MMM YY")) {
                                return (
                                    <div className="bottom">
                                        <div className="date">
                                            {moment(time['from']).format("D MMM YY")}
                                        </div>
                                        <div className="time">
                                            {moment(time['from']).format("hh:mm A")} - {moment(time['to']).format("hh:mm A")}
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <>
                                        <div className="bottom">
                                            <div className="date">
                                                {moment(time['from']).format("D MMM YY")}
                                            </div>
                                            <div className="time">
                                                {moment(time['from']).format("hh:mm A")} - {'00:00 AM'}
                                            </div>
                                        </div>
                                        <div className="bottom">
                                            <div className="date">
                                                {moment(time['to']).format("D MMM YY")}
                                            </div>
                                            <div className="time">
                                                {'00:00 AM'} - {moment(time['to']).format("hh:mm A")}
                                            </div>
                                        </div>
                                    </>
                                );
                            }
                        })
                    }
                </div>
            </div>
        );
    }
}

ScheduleItem.defaultProps = {
    type: 1,
    isOwner: true
};

ScheduleItem.propTypes = {
    jobId: PropTypes.number,
    data: PropTypes.object,
    type: PropTypes.number.isRequired,
    selected: PropTypes.bool,
    isOwner: PropTypes.bool,
    onClick: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    null,
    { ...actions.schedules }
)(ScheduleItem);
