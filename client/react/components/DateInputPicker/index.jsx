import React, { Component } from "react";
import PropTypes from "prop-types";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

class DateInputPicker extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = (ev) => {
        let { value, id } = this.props;
        const { onChange, viewMode } = this.props;
        if(ev.target.id === 'date_prev') {
            value.setDate(value.getDate() - 1);
        }else if(ev.target.id === 'date_next') {
            if (viewMode === 'day') {
                value.setDate(value.getDate() + 1);
            } else if (viewMode === 'week') {
                value.setDate(value.getDate() + 7);
            } else if (viewMode === '2-weeks') {
                value.setDate(value.getDate() + 14);
            } else if (viewMode === '4-weeks') {
                value.setDate(value.getDate() + 28);
            } else if (viewMode === 'year') {
                value = moment(value).add(1, 'year').toDate();
            }
        }
        onChange(id, value);
    }

    render() {
        const { onChange, value, id, isArrow, className, showIcon } = this.props;

        return (
            <React.Fragment>
                <div className={className}>
                    {isArrow?<div className="arrow">
                        <img src="/static/images/icons/icon-arrow-fill-left.svg" id="date_prev" onClick={this.handleClick}></img>
                    </div>:null}
                    <div className="date-container">
                        {showIcon?<img src="/static/images/icons/icon-event.svg"/>:null}
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            selected={(value)}
                            onChange={(date) => onChange(id, date)}
                        />
                    </div>
                    {isArrow?<div className="arrow">
                        <img src="/static/images/icons/icon-arrow-fill-right.svg" id="date_next" onClick={this.handleClick}></img>
                    </div>:null}
                </div>
            </React.Fragment>
        );
    }
}

DateInputPicker.defaultProps = {
    isArrow: true,
    showIcon: true,
    viewMode: 'day'
}

DateInputPicker.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    value: PropTypes.string,
    viewMode: PropTypes.string,
    onChange: PropTypes.func,
    isArrow: PropTypes.bool,
    showIcon: PropTypes.bool,
};

export default DateInputPicker;
