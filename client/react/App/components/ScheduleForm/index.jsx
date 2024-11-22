import React, { Component } from "react";
import PropTypes from "prop-types";
import { TimePicker, Calendar } from "../../../components";
import { time, validation } from "../../../../../utils";
import { map, set, get, isEmpty } from 'lodash';
import moment from 'moment';
import {toast} from "react-toastify";

const initialState = {
    errors: {},
    selectedDate: moment().format('YYYY-MM-DD'),
    time_field: [],
    job: null
};

class ScheduleForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...initialState,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCancelClick = this.handleCancelClick.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.addTimeField = this.addTimeField.bind(this);
        this.changeTimeField = this.changeTimeField.bind(this);
        this.selectDate = this.selectDate.bind(this);
    }

    componentDidMount() {
        const { data, isEdit, job } = this.props;
        let selectedDate = moment().format('YYYY-MM-DD');

        if(isEdit){
            if(job && job.due_date !== "")
                selectedDate = moment(job.due_date).format('YYYY-MM-DD');
            this.setState({
                data: data,
                time_field: data.time_field,
                selectedDate
            });
        }else{
            if(job && job.due_date !== ""){
                selectedDate = moment(job.due_date).format('YYYY-MM-DD');
            }
            this.setState({
                data: {
                    name: '',
                    description: '',
                    time_field: [],
                },
                selectedDate,
                time_field: []
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if(JSON.stringify(this.state.data) !== JSON.stringify(nextProps.data)){
            this.setState({
                data: nextProps.data,
                time_field: nextProps.data.time_field
            })

            if(!nextProps.isEdit){
                this.setState({
                    selectedDate: moment().startOf('day').format('YYYY-MM-DD'),
                    time_field: []
                })
            }
        }

        if(this.state.job !== nextProps.job) {
            this.setState({
                selectedDate: nextProps.job? moment(nextProps.job.due_date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
            })
        }
    }

    convertTimeField(time_field) {
        console.log("Convert time field function");
        let new_time_field = [];
        for(let i = 0; i < time_field.length; i += 1){
            if(moment(time_field[i].from).diff(moment(time_field[i].to, 'day')) !== 0){
                const start_date = moment(time_field[i].from).format('YYYY-MM-DD');
                const end_date = moment(time_field[i].to).format('YYYY-MM-DD');
                const end = moment(time_field[i].from).endOf('day');
                const start = moment(time_field[i].to).startOf('day');
                new_time_field.push({from: time_field[i].from, to: moment(start_date + " " + moment(end).format('HH:mm:ss')).format('YYYY-MM-DDTHH:mm:ssZ')});
                new_time_field.push({from: moment(end_date + " " + moment(start).format('HH:mm:ss')).format('YYYY-MM-DDTHH:mm:ssZ'), to: time_field[i].to});
            }else{
                new_time_field.push(time_field[i])
            }
        }
        return new_time_field;
    }

    handleSaveClick(e) {
        e.preventDefault();
        const { onSubmit } = this.props;
        let { data } = this.props;

        console.log(data);

        if(validation.isEmpty(data.name)){
            toast.error("Schedule name is empty");
            return;
        }

        if(validation.isEmpty(data.time_field)){
            toast.error("Please enter working time");
            return;
        }

        for(let i = 0; i < data.time_field.length; i++) {
            if(data.time_field[i].from >= data.time_field[i].to) {
                toast.error("Please enter valid working time");
                return;
            }
        }

        set(data, 'time_field', time.mergeOverlap(data.time_field));
        onSubmit(data, true)
    }

    handleCancelClick(e) {
        e.preventDefault();
        const { onSubmit } = this.props;
        onSubmit(null, false)
    }

    handleInputChange({target: {id, value}}) {
        let { data } = this.props;
        const { onUpdate } = this.props;

        data = set(data, id, value);
        onUpdate(data);
    }

    changeTimeField(value, key, is_from) {
        let { selectedDate } = this.state;
        let { data } = this.props;
        const {onUpdate} = this.props;
        if(is_from){
            const from = moment(selectedDate + " " + value).format('YYYY-MM-DDTHH:mm:ssZ');
            if(data.time_field[key].to && !time.compareDate(from, data.time_field[key].to)) {
                data.time_field[key].to = moment(data.time_field[key].to).add(1, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
            }
            data.time_field[key].from = from;
        }else{
            const to = moment(selectedDate + " " + value).format('YYYY-MM-DDTHH:mm:ssZ');
            if(data.time_field[key].from && !time.compareDate(data.time_field[key].from, to)) {
                data.time_field[key].to = moment(to).add(1, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
            }else
                data.time_field[key].to = to;
        }
        onUpdate(data);
    }

    addTimeField(){
        let { selectedDate } = this.state;

        if (selectedDate == null || selectedDate == "Invalid date") {
            toast.error("Please select a date first!");
            return;
        }

        let { data } = this.props;
        const { onUpdate } = this.props;

        let schedule = data;

        if (!schedule || Object.keys(schedule).length === 0) {
            schedule = {
                name: '',
                description: '',
                time_field: []
            }
        }
        const from = moment(selectedDate + " 0:00:00").format('YYYY-MM-DDTHH:mm:ssZ');
        const to = moment(selectedDate + " 23:00:00").format('YYYY-MM-DDTHH:mm:ssZ');

        schedule.time_field.push({from, to});

        onUpdate(schedule);
    }

    removeTimeField(key) {
        let { data } = this.props;
        const { onUpdate } = this.props;
        data.time_field.splice(key, 1);
        onUpdate(data);
    }

    selectDate(date) {
        const { time_field } = this.state;
        let time_fields = time_field;

        time_fields.forEach(field => {
            field["from"] = moment(date).format('YYYY-MM-DD') + field["from"].slice(10);
            field["to"] = moment(date).format('YYYY-MM-DD') + field["to"].slice(10);
        })

        this.setState({
            selectedDate: moment(date).format('YYYY-MM-DD'),
            time_field: time_fields
        });

    }

    render() {
        const { isEdit, data: {name, description, time_field} } = this.props;
        const { selectedDate } = this.state;
        
        return (
            <form className="schedule-form">
                <div className="row">
                    <div className="col-xl-4 col-md-12 schedule-header-title">
                        <h5>{isEdit?"Edit Schedule":"New Schedule"}</h5>
                    </div>
                    <div className="col-xl-4 col-md-12">
                        <button type="button" className="btn btn-default btn-block" onClick={this.handleCancelClick}>Cancel</button>
                    </div>
                    <div className="col-xl-4 col-md-12">
                        <button type="button" className="btn btn-success btn-block" onClick={this.handleSaveClick}>Save</button>
                    </div>
                </div>
                <div className="editable-field edit-mode">
                    <div className="section-header">
                        <h6>Schedule Name</h6>
                    </div>

                    <input type="text" className="form-control input-field" value={name} id="name" placeholder="Add Schedules" onChange={this.handleInputChange} required />
                </div>
                
                <div className="editable-field edit-mode">
                    <Calendar schedule={time_field} date={selectedDate} onSelect={this.selectDate}></Calendar>
                </div>
                <div className="editable-field edit-mode">
                    <div className="section-header">
                        <h6>Working Time</h6>
                        <div className="editable-field second-type">
                            <div className="action" onClick={this.addTimeField}>
                                <img src="/static/images/icons/icon-new-green.svg" alt="" />
                            </div>
                        </div>
                    </div>
                    {time_field && time_field.map((item, key) => {
                        const toDate = moment(moment(item.to).format('YYYY-MM-DD'));
                        const fromDate = moment(moment(item.from).format('YYYY-MM-DD'));

                        return (
                            <div className={"row mt-2" + (moment(item.from).format("YYYY-MM-DD") === selectedDate ? " timefield-in-date":"")} key={key}>
                                <div className="col-6">
                                    <div className={`d-flex align-items-center ${toDate > fromDate?'mt-4':''}`}>
                                        <div className="workingtime-label">Start</div>
                                        <TimePicker value={item.from? moment(item.from).format('HH:mm') : '00:00' } onChange={(value) => this.changeTimeField(value, key, true) }/>
                                    </div>
                                </div>
                                <div className="col-6">
                                    {toDate > fromDate?"(Next Day)":null}
                                    <div className="d-flex align-items-center">
                                        <div className="workingtime-label">End</div>
                                        <TimePicker value={item.to? moment(item.to).format('HH:mm') :'00:00' } onChange={(value) => this.changeTimeField(value, key, false) }/>
                                        <div className="action">
                                            <i className="fa fa-times" onClick={() => this.removeTimeField(key)}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                </div>
                <div className="editable-field edit-mode">
                    <div className="section-header">
                        <h6>Additional Content</h6>
                    </div>

                    <input type="text" className="form-control input-field" value={description} id="description" onChange={this.handleInputChange}/>
                </div>
            </form>
        );
    }
}

ScheduleForm.propTypes = {
    isEdit: PropTypes.bool,
    data: PropTypes.object,
    onSubmit: PropTypes.func,
    onUpdate: PropTypes.func,
};

export default ScheduleForm;
