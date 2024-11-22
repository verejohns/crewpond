import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import DatePicker from 'react-date-picker';
import moment from 'moment';
import PropTypes from 'prop-types';
import { paths } from '../../../../../../utils';

class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dateSelected: new Date(),
            showCalendar: false,
        }
    }

    componentDidMount() {
        const date = (new URLSearchParams(window.location.search)).get("startDate");
        this.setState({
            dateSelected: date?moment(date).toDate():moment().toDate()
        })
    }

    updateStartDate = dt => {
        const viewMode = (new URLSearchParams(window.location.search)).get("viewMode");

        this.setState({
            dateSelected: dt
        });
        this.updateHeaderParams(viewMode, dt);
    };

    updateViewMode = mode => {
        const { dateSelected } = this.state;

        this.updateHeaderParams(mode, dateSelected)
    };

    updateHeaderParams = (viewMode, dt) => {
        const { history: {push} } = this.props;
        const job_id = (new URLSearchParams(window.location.search)).get("jobId");

        let start_date;
        if (viewMode === 'day') {
            start_date = moment(dt).set({hour: 0, minute: 0, second: 0}).format('YYYY-MM-DDTHH:mm:ssZ'); 
        } else if (viewMode  === 'week') { 
            start_date = moment(dt).startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode  === 'month') {
            start_date = moment(dt).startOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
        } else {
            start_date = moment(dt).startOf('year').format('YYYY-MM-DDTHH:mm:ssZ');
        }
        let params = `?viewMode=${viewMode}&startDate=${encodeURIComponent(start_date).replace(" ", "%20")}`;
        if(job_id)
            params += `&jobId=${job_id}`
        push({pathname: paths.client.APP_SCHEDULE, search: params});
    };

    handleCalendar = () => {
        const { showCalendar } = this.state;

        this.setState({
            showCalendar: !showCalendar
        })
    };

    onClickPrev = () => {
        let { dateSelected } = this.state;
        const { history: {push} } = this.props;
        const viewMode = (new URLSearchParams(window.location.search)).get("viewMode");
        const job_id = (new URLSearchParams(window.location.search)).get("jobId");

        if (viewMode === 'day') {
            //dateSelected = moment(dateSelected).subtract(1, 'day').toDate();
            dateSelected = moment(dateSelected).subtract(1, 'day').format('YYYY-MM-DDTHH:mm:ssZ')
        } else if (viewMode === 'week') {
            //dateSelected = moment(dateSelected).subtract(1, 'week').toDate();
            dateSelected = moment(dateSelected).subtract(1, 'week').format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode === 'month' || viewMode === '4-weeks') {
            // dateSelected = moment(dateSelected).subtract(1, 'month').toDate();
            dateSelected = moment(dateSelected).subtract(1, 'month').format('YYYY-MM-DDTHH:mm:ssZ');
        } else {
            // dateSelected = moment(dateSelected).subtract(1, 'year').toDate();
            dateSelected = moment(dateSelected).subtract(1, 'year').format('YYYY-MM-DDTHH:mm:ssZ');
        }

        this.setState({ dateSelected });
        let params = `?viewMode=${viewMode}&startDate=${encodeURIComponent(dateSelected).replace(" ", "%20")}`;
        if(job_id)
            params += `&jobId=${job_id}`
        console.log(params);
        push({pathname: paths.client.APP_SCHEDULE, search: params});
    };

    onClickNext = () => {
        let { dateSelected } = this.state;
        const { history: {push} } = this.props;
        const viewMode = (new URLSearchParams(window.location.search)).get("viewMode");
        const job_id = (new URLSearchParams(window.location.search)).get("jobId");

        if (viewMode === 'day') {
            // dateSelected = moment(dateSelected).add(1, 'day').toDate();
            dateSelected = moment(dateSelected).add(1, 'day').format('YYYY-MM-DDTHH:mm:ssZ'); 
        } else if (viewMode === 'week') {
            // dateSelected = moment(dateSelected).add(1, 'week').toDate();
            dateSelected = moment(dateSelected).add(1, 'week').format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode === 'month' || viewMode === '4-weeks') {
            // dateSelected = moment(dateSelected).add(1, 'month').toDate();
            dateSelected = moment(dateSelected).add(1, 'month').format('YYYY-MM-DDTHH:mm:ssZ');
        } else {
            // dateSelected = moment(dateSelected).add(1, 'year').toDate();
            dateSelected = moment(dateSelected).add(1, 'year').format('YYYY-MM-DDTHH:mm:ssZ');
        }

        this.setState({ dateSelected });
        let params = `?viewMode=${viewMode}&startDate=${encodeURIComponent(dateSelected).replace(" ", "%20")}`;
        if(job_id)
            params += `&jobId=${job_id}`
        console.log(params);
        push({pathname: paths.client.APP_SCHEDULE, search: params});
    };

    render() {
        const { dateSelected, showCalendar } = this.state;
        const viewMode = (new URLSearchParams(window.location.search)).get("viewMode");
        const start_date = (new URLSearchParams(window.location.search)).get("startDate");

        let headerCells = [];
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

        if (!viewMode || viewMode === 'day') {
            for (let i = 0; i <= 12; i++) {
                headerCells.push(<div className="header-cell">{i} AM</div>);
            }
            for (let i = 1; i < 12; i++) {
                headerCells.push(<div className="header-cell">{i} PM</div>);
            }
        } else if (viewMode === 'week') {
            const dt = start_date?moment(start_date):moment();
            for (let i = 0; i < 7; i ++) {
                headerCells.push(<div className="header-cell">{days[i]} {dt.format('D')}</div>);
                dt.add(1, 'days');
            }
        } else if (viewMode === 'month' || viewMode === '4-weeks') {
            for (const day of days) {
                headerCells.push(<div className="header-cell">{day}</div>)
            }
        }

        return (
            <React.Fragment>
                <div className="view-mode-picker">
                    <span
                        className={`view-mode${viewMode === 'day' ? ' active' : ''}`}
                        onClick={() => this.updateViewMode('day')}
                    >
                        Day
                    </span>
                    <span
                        className={`view-mode${viewMode === 'week' ? ' active' : ''}`}
                        onClick={() => this.updateViewMode('week')}
                    >
                        Week
                    </span>
                    <span
                        className={`view-mode${(viewMode === 'month' || viewMode === '4-weeks') ? ' active' : ''}`}
                        onClick={() => this.updateViewMode('month')}
                    >
                        Month
                    </span>
                    <span
                        className={`view-mode${viewMode === 'year' ? ' active' : ''}`}
                        onClick={() => this.updateViewMode('year')}
                    >
                        Year
                    </span>
                </div>
                <div className="calendar-nav">
                    <span className="fa fa-angle-left" onClick={this.onClickPrev} />
                    {showCalendar && (
                        <DatePicker
                            value={dateSelected}
                            maxDetail={viewMode === 'year' ? 'decade' : (viewMode === 'month' || viewMode === '4-weeks') ? 'year' : 'month'}
                            view={viewMode === 'year' ? 'decade' : (viewMode === 'month' || viewMode === '4-weeks') ? 'year' : 'month'}
                            calendarIcon={null}
                            clearIcon={null}
                            onChange={this.updateStartDate}
                            onCalendarClose={this.handleCalendar}
                            isOpen
                            required
                        />
                    )}
                    <div className="calendar-label" onClick={this.handleCalendar}>
                        {viewMode === 'year' ?
                            moment(dateSelected).format('YYYY') :
                            (viewMode === 'month' || viewMode === '4-weeks') ?
                                moment(dateSelected).format('MMMM YYYY') :
                                moment(dateSelected).format('MMM DD, YYYY')
                        }
                    </div>
                    <span className="fa fa-angle-right" onClick={this.onClickNext} />
                </div>
                {viewMode !== 'year' && (
                    <div className="header">
                        {headerCells}
                    </div>
                )}
            </React.Fragment>
        )
    }
}

Header.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default withRouter(Header);
