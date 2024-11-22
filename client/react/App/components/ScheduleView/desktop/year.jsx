import React, { Component } from 'react';
import Calendar from 'react-calendar';
import PerfectScrollbar from "react-perfect-scrollbar";
import moment from 'moment';
import PropTypes from 'prop-types';

import Loader from '../loader';

class YearView extends Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.setState({
                value: nextProps.value,
            });
        }
    }

    render() {
        const { year, times, isLoading, onSelectDate } = this.props;
        const dt = moment(year, 'YYYY');
        const dates = [];

        for (let i = 0; i < 12; i++) {
            dates.push(dt.format());
            dt.add(1, 'months');
        }

        return (
            <React.Fragment>
                {isLoading && <Loader />}
                <PerfectScrollbar>
                    <div className="calendars-list">
                        {dates.map((dt, idx) => {
                            const values = [...new Set(times.filter(item =>
                                moment(item.time) >= moment(dt) && moment(item.time) <= moment(dt).endOf('month')
                            ).map(item => moment(item.time).format('YYYYMMDD')))];

                            return (
                                <div className="month" key={idx}>
                                    <h5>{moment(dt).format('MMMM')}</h5>
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
                                        onClickDay={onSelectDate}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </PerfectScrollbar>
            </React.Fragment>
        )
    }
}

YearView.propTypes = {
    year: PropTypes.string.isRequired,
    times: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isLoading: PropTypes.bool.isRequired,
    onSelectDate: PropTypes.func.isRequired
};

export default YearView;
