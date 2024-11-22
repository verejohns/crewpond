import React, { Component } from "react";
import moment from 'moment';
import PropTypes from "prop-types";


class Calendar extends Component {
    constructor(props) {
      super(props);
      this.state = {
        month: moment(),
        selected: moment().startOf('day'),
        range: 'weekly',
      };
      this.previous = this.previous.bind(this);
      this.next = this.next.bind(this);
      this.selectRange = this.selectRange.bind(this);
    }

    componentDidMount() {
      this.setState({
        month: this.props.date?moment(this.props.date):moment(),
        selected: this.props.date?moment(this.props.date).startOf('day'):moment().startOf('day'),
      })
    }

    componentWillReceiveProps(nextProps) {
      if(this.state.selected !== moment(nextProps.date).startOf('day')) {
        this.setState({
          month: nextProps.month?moment(nextProps.date):moment(),
          selected: nextProps.date?moment(nextProps.date).startOf('day'):moment().startOf('day')
        })
      }
    }

    previous() {
      const {
        month,
      } = this.state;
      this.setState({
        month: month.subtract(1, 'month'),
      });
    }

    next() {
      const {
        month,
      } = this.state;

      this.setState({
        month: month.add(1,'month'),
      });
    }

    select(day) {
      const { onSelect } = this.props;
      this.setState({
        selected: day.date,
        month: day.date.clone(),
      });

      onSelect(day.date)
    }

    selectRange(range) {
        this.setState({
            range: range
        })
    }

    renderMonths() {
        // return null
        return (
            <div className="calendar">
                <div className="cal-header">
                <ViewRange range={this.state.range} selectRange={this.selectRange}/>
                <div className="month-display row">
                    <i className="arrow fa fa-angle-left" onClick={this.previous}/>
                    {this.renderMonthLabel()}
                    <i className="arrow fa fa-angle-right" onClick={this.next}/>
                </div>
                <DayNames></DayNames>
                </div>
                <MonthView></MonthView>
            </div>
        );
    }

    renderWeekTimes() {
        return (
            <div className="calendar">
                <div className="cal-header">
                    <ViewRange range={this.state.range} selectRange={this.selectRange}/>
                    <div className="month-display row">
                    <i className="arrow fa fa-angle-left" onClick={this.previous}/>
                    {this.renderMonthLabel()}
                    <i className="arrow fa fa-angle-right" onClick={this.next}/>
                    </div>
                    <Weeks></Weeks>
                </div>
                <WeekTime></WeekTime>
            </div>
        )
    }

    renderHours() {
        return (
            <div className="calendar">
                <div className="cal-header">
                    <ViewRange range={this.state.range} selectRange={this.selectRange}/>
                    <div className="month-display row">
                    <i className="arrow fa fa-angle-left" onClick={this.previous}/>
                    {this.renderMonthLabel()}
                    <i className="arrow fa fa-angle-right" onClick={this.next}/>
                    </div>
                    <Hours></Hours>
                </div>
                <DayHours></DayHours>
            </div>
        )
    }

    renderWeeks() {
      let weeks = [];
      let done = false;
      let date = this.state.month.clone().startOf("month").add("w" -1).day("Sunday");

      let count = 0;
      let monthIndex = date.month();

      const {
        selected,
        month,
      } = this.state;

      const { schedule } = this.props;
      while (!done) {
        weeks.push(
          <Week key={date}
            date={date.clone()}
            month={month}
            schedule={schedule}
            select={(day)=>this.select(day)}
            selected={selected} />
        );

        date.add(1, "w");

        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
      }

      return (
        <div className="calendar">
            <div className="cal-header">
            {/* <ViewRange range={this.state.range} selectRange={this.selectRange}/> */}
            <div className="month-display row">
                <i className="arrow fa fa-angle-left" onClick={this.previous}/>
                {this.renderMonthLabel()}
                <i className="arrow fa fa-angle-right" onClick={this.next}/>
            </div>
            <DayNames></DayNames>
            </div>
            {weeks}
        </div>
      );
    };

    renderMonthLabel() {
      const {
        month,
      } = this.state;

      return <span className="month-label">{month.format("MMMM YYYY")}</span>;
    }

    render() {
      const { range } = this.state;
      if(range === "weekly")
        return this.renderWeeks();
      else if(range === "monthly")
        return this.renderMonths();
      else if(range === "daily")
        return this.renderWeekTimes();
      else if(range === "hourly")
        return this.renderHours();
      else
        return null;
    }
  }

  class ViewRange extends Component {
      render () {
          const {range, selectRange} = this.props;
          return (
              <div className="row range-bar">
                <div className={"view-range day-range" + (range==='hourly'?" selected":"")} onClick={() => selectRange('hourly')}>
                    {"Day"}
                </div>
                <div className={"view-range" + (range==='daily'?" selected":"")} onClick={() => selectRange('daily')}>
                    {"Week"}
                </div>
                <div className={"view-range" + (range==='weekly'?" selected":"")} onClick={() => selectRange('weekly')}>
                    {"Month"}
                </div>
                <div className={"view-range year-range" + (range==='monthly'?" selected":"")} onClick={() => selectRange('monthly')}>
                    {"Year"}
                </div>
              </div>
          )
      }
  }

  class DayNames extends Component {
      render() {
          return (
            <div className="row day-names">
              <span className="day">S</span>
              <span className="day">M</span>
              <span className="day">T</span>
              <span className="day">W</span>
              <span className="day">T</span>
              <span className="day">F</span>
              <span className="day">S</span>
            </div>
          );
      }
  }

    class Weeks extends Component {
        render() {
            return (
            <div className="row day-names">
                <span className="day"></span>
                <span className="day">S</span>
                <span className="day">M</span>
                <span className="day">T</span>
                <span className="day">W</span>
                <span className="day">T</span>
                <span className="day">F</span>
                <span className="day">S</span>
            </div>
            );
        }
    }

    class Hours extends Component {
        render() {
            const weekdays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return (
            <div className="row day-names">
                <span className="day">{weekdays[moment().isoWeekday()]}</span>
            </div>
            );
        }
    }

  class Month extends Component {
    getMonthRange () {
        const startDate = moment().startOf('year');
        const endDate = moment().endOf('year');

        const focus = startDate.startOf('month');
        const size = endDate.diff(startDate, 'month') + 1;

        return Array(size).fill(0).map((n, i) => focus.clone().add(n + i, 'months'));
    }

    select(day) {
    }

    renderWeeks(month_date) {
        let weeks = [];
        let done = false;

        let date = month_date.clone().startOf("month").add("w" -1).day("Sunday");
        let count = 0;
        let monthIndex = date.month();

        while (!done) {
          weeks.push(
            <Week key={date}
              date={date.clone()}
              month={month_date}
              select={(day)=>this.select(day)}
              selected={false} />
          );

          date.add(1, "w");

          done = count++ > 2 && monthIndex !== date.month();
          monthIndex = date.month();
        }

        return weeks;
    };

    render() {
        let months = [];
        this.getMonthRange().map(date => {
            months.push(
              <td
                key={date.month()}
                className="calendar-month"
              >
                <span>{date.format('MMM')}</span>
                {this.renderWeeks(date)}
              </td>
            );
        });

        let rows = [];
        let cells = [];

        months.forEach((row, i) => {
            if (i % 2 !== 0 || i == 0) {
              cells.push(row);
            } else {
              rows.push(cells);
              cells = [];
              cells.push(row);
            }
        });
        rows.push(cells);
        let monthlist = rows.map((d, i) => {
            return <tr>{d}</tr>;
        });

        return (
            <div className="months-container">
                <table className="calendar-months">
                <tbody>{monthlist}</tbody>
                </table>
            </div>
        );
    }
  }

  class Week extends Component {
    render() {
      let days = [];
      let {
        date,
      } = this.props;

      const {
        month,
        selected,
        select,
        schedule
      } = this.props;

      for (var i = 0; i < 7; i++) {
        let day = {
            name: date.format("dd").substring(0, 1),
            number: date.date(),
            isCurrentMonth: date.month() === month.month(),
            isToday: date.isSame(new Date(), "day"),
            date: date
        };

        const in_schedule = schedule.find(function(el){
          return moment(el.from).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD")
        })?true:false;
        days.push(
          <Day day={day}
            selected={selected}
            in_schedule={in_schedule}
            select={select}/>
        );

        date = date.clone();
        date.add(1, "day");
      }

      return (
        <div className="row week" key={days[0]}>
          {days}
        </div>
      );
    }
  }


  class Day extends Component {
    render() {
      const {
        day,
        day: {
          date,
          isCurrentMonth,
          isToday,
          number
        },
        select,
        selected,
        in_schedule
      } = this.props;

      return (
        <span
          key={date.toString()}
          className={"day" + (isToday ? " today" : "") + (isCurrentMonth ? "" : " different-month") + (date.isSame(selected) ? " selected" : "")}
          onClick={()=>select(day)}>{number}
          {in_schedule?<div className="schedule-mark"></div>:null}
        </span>
      );
    }
  }

  class WeekTime extends Component {

    render(){
        let hours = [];
        for(let i = 0; i < 24; i += 1){
            let time = i + ":00";
            if(i < 10){
               time = "0" + time;
            }

            hours.push(
                <div className="row">
                    <span class="hour">{time}</span>
                    <span class="hour"></span>
                    <span class="hour"></span>
                    <span class="hour"></span>
                    <span class="hour"></span>
                    <span class="hour"></span>
                    <span class="hour"></span>
                    <span class="hour"></span>
                </div>
            )
        }
        return(
            <div className="week-times">
                {hours}
            </div>
        );
    }


  }

  class DayHours extends Component {
    render (){
        let hours = [];
        for(let i = 0; i < 24; i += 1){
            let time = i + ":00";
            if(i < 10){
               time = "0" + time;
            }

            hours.push(
                <div className="row">
                    <span class="hour-name">{time}</span>
                    <span class="hour"></span>
                </div>
            )
        }
        return(
            <div className="day-times">
                {hours}
            </div>
        );
    }
  }

Calendar.defaultProps = {
  schedule: [],
};

Calendar.propTypes = {
  schedule: PropTypes.array,
  onSelect: PropTypes.func,
  date: PropTypes.string
};

export default Calendar;
