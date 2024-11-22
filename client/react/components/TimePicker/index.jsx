import React                      from 'react';
import PropTypes                  from 'prop-types';

class TimePicker extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      isHourEdit: true,
      time_field_tags: [],
      hh: '00',
      mm: '00',
      isShowPicker: false
    }
    this.timeWrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    const {value} = this.props;
    this.setState({
      time_field_tags: this.generateFormattedHour(),
      hh: value.split(':')[0],
      mm: value.split(':')[1]
    });
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value !== this.props.value) {
      this.setState({
        hh: nextProps.value.split(':')[0],
        mm: nextProps.value.split(':')[1]
      })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.timeWrapperRef.current && !this.timeWrapperRef.current.contains(event.target)) {
      this.onShowPicker();
    }
  }

  generateFormattedHour() {
    let time_fields = [];
    for(let i = 0; i < 24; i += 1) {
      time_fields.push(("0"+i).slice(-2) + ":00");
    }
    let time_field_tags = [];
    for(let i = 0; i < 3; i += 1) {
      for(let j = 0; j <= 21; j += 3) {
        time_field_tags.push(<li id="hour" onClick={(ev) => this.handleSelect(ev, time_fields[i + j])}>{time_fields[i + j]}</li>)
      }
    }
    return time_field_tags;
  }

  generateFormattedMinutes(hour) {
    let time_fields = [];
    for(let i = 0; i < 60; i += 5) {
      time_fields.push(("0"+hour).slice(-2) + ":" + ("0"+i).slice(-2));
    }
    let time_field_tags = [];
    for(let i = 0; i < 3; i += 1) {
      for(let j = 0; j <= 12; j += 3) {
        time_field_tags.push(<li id="minute" onClick={(ev) => this.handleSelect(ev, time_fields[i + j])}>{time_fields[i + j]}</li>)
      }
    }
    return time_field_tags;
  }

  handleSelect = (ev, time) => {
    const { onChange } = this.props;
    const { hh, mm } = this.state;
    if(ev.target.id === 'hour') {
      const hour = time.split(':')[0];
      onChange(hour + ":" + mm);
    }else if(ev.target.id === 'minute') {
      const minute = time.split(':')[1];
      onChange(hh + ":" + minute);
    }
  }

  handleFocus = (ev) => {
    if(ev.target.id === 'hour_field'){
      this.setState({
        time_field_tags: this.generateFormattedHour()
      });
    }else if(ev.target.id === 'minute_field') {
      const { value } = this.props;
      let hour = 0;
      if(value.length > 0)
        hour = value.split(':')[0];
      this.setState({
        time_field_tags: this.generateFormattedMinutes(hour)
      });
    }
  }

  handleInputChange = (ev) => {
    const { onChange } = this.props;
    const { hh, mm } = this.state;
    if(ev.target.id === 'hour_field') {
      if(ev.target.value.length < 3 && ev.target.value < 24){
        const hour = ("0"+ev.target.value).slice(-2);
        onChange(hour + ":" + mm);
      }
    }else if(ev.target.id === 'minute' && ev.target.value < 60) {
      if(ev.target.value.length < 3){
        const minute = ("0"+ev.target.value).slice(-2);;
        onChange(hh + ":" + minute);
      }
    }
  }

  onShowPicker = () => {
    this.setState({isShowPicker:!this.state.isShowPicker});
  }

  render () {
    const { value, timefield_in_date,  } = this.props;
    const { time_field_tags, hh, mm, isShowPicker } = this.state;
    
    return (
      <div className={"time-picker" + (timefield_in_date?" timefield-in-date":"")} >
        <div className="time-field" onClick={this.onShowPicker}>{value}</div>
        {isShowPicker?<div className="card time-picker-card" id="time_picker_card" ref={this.timeWrapperRef}>
          <div className="card-body">
            <div className="time-input mb-3">
              <input type="number" className="form-control dark-input mr-1" value={hh} id="hour_field" onFocus={this.handleFocus} onChange={this.handleInputChange}></input> : <input type="number" className="form-control dark-input ml-1" value={mm} id="minute_field" onFocus={this.handleFocus} onChange={this.handleInputChange}></input>
            </div>
            <ul>
              {time_field_tags}
            </ul>
          </div>
        </div>:null}
      </div>
    );    
  }
}

TimePicker.defaultProps = {
  value: '00:00',
};

TimePicker.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    timefield_in_date: PropTypes.bool
};

export default TimePicker;