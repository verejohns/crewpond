import React, { Component } from 'react';
import Calendar from 'react-calendar';
import moment from 'moment';
import PropTypes from 'prop-types';

class CalendarView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { start_date, viewMode, times } = this.props;
        const dt = moment(start_date);
        const dates = [];

        if (viewMode === 'month' || viewMode === '4-weeks') {
            dates.push(dt.format());
        } else {
            for (let i = 0; i < 12; i++) {
                dates.push(dt.format());
                dt.add(1, 'months');
            }
        }

        return (
            <div className="calendars-list">
                {dates.map((dt, idx) => {
                    const values = [...new Set(times.filter(item =>
                        moment(item.time) >= moment(dt) && moment(item.time) <= moment(dt).endOf('month')
                    ).map(item => moment(item.time).format('YYYYMMDD')))];

                    return (
                        <div className="month" key={idx}>
                            {viewMode === 'year' && <h5>{moment(dt).format('MMMM')}</h5>}
                            <Calendar
                                activeStartDate={moment(dt).toDate()}
                                minDate={moment(dt).toDate()}
                                maxDate={moment(dt).endOf('month').toDate()}
                                showNavigation={false}
                                showFixedNumberOfWeeks={true}
                                tileClassName={({ date }) => {
                                    if (values.includes(moment(date).format('YYYYMMDD'))) {
                                        return 'scheduled';
                                    }

                                    return null;
                                }}
                                formatShortWeekday={(locale, date) => moment(date).format('dd')[0]}
                            />
                        </div>
                    )
                })}
            </div>
        )
    }
}

CalendarView.propTypes = {
    start_date: PropTypes.string.isRequired,
    viewMode: PropTypes.string.isRequired,
    times: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CalendarView;