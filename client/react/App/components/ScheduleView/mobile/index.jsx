import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import moment from 'moment';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import $ from 'jquery';

import Header from './header';
import CalendarView from './calendar';
import Loader from '../loader';
import Time from './time';
import selectors from './selectors';
import actions from '../../../actions';

class MobileView extends Component {
    constructor(props) {
        super(props);
        this.statistics = {
            assigned: 0,
            open: 0,
            unpublished: 0
        };
    }

    handleScroll = container => {
        const elem = $('.schedule-view-card .card-header .header')[0];

        if (elem) {
            elem.scrollLeft = container.scrollLeft;
        }
    };

    renderScheduleList = cellWidth => {
        const { jobs } = this.props;

        const viewMode = (new URLSearchParams(window.location.search)).get("viewMode") || 'day';
        const start_date = (new URLSearchParams(window.location.search)).get("startDate") || moment();

        const startDate = start_date?moment(start_date):moment();
        const time_arr = [[]];
        let schedules = [];

        for (const job of jobs) {
            schedules = schedules.concat(job.schedules);
        }

        for (const schedule of schedules) {
            if (schedule.jobbers.length > 0) {
                this.statistics.assigned += 1;
            } else {
                this.statistics.open += 1;
            }
            if (schedule.unpublished) {
                this.statistics.unpublished += 1;
            }
            for (const time of schedule.time_field) {
                const begin = moment(time['from']);
                const end = moment(time['to']);
                let pos = 0, length = 0;

                if (viewMode === 'day') {
                    pos = begin.diff(startDate, 'hours');
                    length = end.diff(begin, 'hours') + 1;
                } else {
                    pos = begin.diff(startDate, 'days');
                    length = end.diff(begin, 'days') + 1;
                }

                let is_added = false;
                for (let i = 0; i < time_arr.length; i++) {
                    let is_duplicated = false;

                    for (const item of time_arr[i]) {
                        if (item.pos >= pos && item.pos < pos + length) {
                            is_duplicated = true;
                            break;
                        } else if (pos >= item.pos && pos < item.pos + item.length) {
                            is_duplicated = true;
                            break;
                        }
                    }

                    if (!is_duplicated) {
                        is_added = true;
                        time_arr[i].push({
                            name: schedule.name,
                            begin: begin.format('ha'),
                            end: end.format('ha'),
                            pos: pos,
                            jobbers: schedule.jobbers,
                            length: length
                        });
                        break;
                    }
                }

                if (!is_added) {
                    time_arr.push([{
                        name: schedule.name,
                        begin: begin.format('ha'),
                        end: end.format('ha'),
                        pos: pos,
                        jobbers: schedule.jobbers,
                        length: length
                    }]);
                }
            }
        }

        return time_arr.map((arr, idx) => (
            <div className="job-schedule" key={idx}>
                {arr.map((time, i) => (
                    <Time
                        key={i}
                        cellWidth={cellWidth}
                        {...time}
                    />
                ))}
            </div>
        ))
    };

    render() {
        const { isLoading } = this.props;
        const viewMode = (new URLSearchParams(window.location.search)).get("viewMode") || 'day';
        const start_date = (new URLSearchParams(window.location.search)).get("startDate") || moment();
        const job_id = (new URLSearchParams(window.location.search)).get("jobId");

        const jobs = job_id ? this.props.jobs.filter(job => job.id == job_id) : this.props.jobs;
        const cells = [];
        let content, cn = 'card schedule-view-card';
        this.statistics = {
            assigned: 0,
            open: 0,
            unpublished: 0
        };


        if (viewMode === 'day' || viewMode === 'week') {
            if (viewMode === 'day') {
                cn += ' daily-view';
                for (let i = 0; i < 24; i ++) {
                    cells.push(<div className={`cell${i % 2 === 1 ? ' odd' : ''}`} />);
                }
            } else {
                cn += ' weekly-view';
                for (let i = 0; i < 7; i ++) {
                    cells.push(<div className={`cell${i % 2 === 1 ? ' odd' : ''}`} />);
                }
            }

            const cellWidth = Math.max((window.innerWidth - 30) / cells.length, 50);

            content = (
                <div className="schedules-wrapper" style={{ width: `${cellWidth * cells.length}px` }}>
                    <div className="cell-list">
                        {cells}
                    </div>
                    {this.renderScheduleList(cellWidth)}
                </div>
            );
        } else {
            if (viewMode === 'month' || viewMode === '4-weeks') {
                cn += ' monthly-view';
            } else {
                cn += ' yearly-view';
            }

            const times = [];
            for (const job of jobs) {
                for (const schedule of job.schedules) {
                    if (schedule.jobbers.length > 0) {
                        this.statistics.assigned += 1;
                    } else {
                        this.statistics.open += 1;
                    }
                    if (schedule.unpublished) {
                        this.statistics.unpublished += 1;
                    }

                    for (const time of schedule.time_field) {
                        times.push({
                            time: moment(time['from']).format(),
                            job: omit(job, ['schedules']),
                            schedule: omit(schedule, ['time_field'])
                        });
                        times.push({
                            time: moment(time['to']).format(),
                            job: omit(job, ['schedules']),
                            schedule: omit(schedule, ['time_field'])
                        });
                    }
                }
            }

            content = (
                <CalendarView
                    start_date={start_date?moment(start_date).format():moment().format()}
                    viewMode={viewMode}
                    times={times}
                />
            )
        }

        return (
            <React.Fragment>
                <div className={cn}>
                    <div className="card-header">
                        <Header />
                    </div>
                    <div className="card-body">
                        {isLoading && <Loader />}
                        <PerfectScrollbar
                            onScrollX={this.handleScroll}
                            options={{
                                suppressScrollX: isLoading,
                                suppressScrollY: isLoading
                            }}
                        >
                            {content}
                        </PerfectScrollbar>
                    </div>
                </div>
                <div className='schedule-status-list'>
                    <div className='status-info'>
                        <span className='status-dot assigned-status' />
                        <span>{this.statistics.assigned} Assigned</span>
                    </div>
                    <div className='status-info'>
                        <span className='status-dot open-status' />
                        <span>{this.statistics.open} Open Schedule</span>
                    </div>
                    <div className='status-info'>
                        <span className='status-dot warning-status' />
                        <span>{this.statistics.unpublished} Warning</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

MobileView.propTypes = {
    jobs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isLoading: PropTypes.bool.isRequired,
};

export default connect(
    selectors,
    { ...actions.schedules }
)(withRouter(MobileView));
