import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from 'react-redux/es/connect/connect';
import actions from '../../actions';
import { withRouter } from 'react-router-dom';
import { messages, time, paths } from '../../../../../utils';
import moment from 'moment';

import {toast} from "react-toastify";
import Select from 'react-select';
import { TimePicker, Calendar } from "../../../components";
import { Modal, ModalBody} from 'reactstrap';

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: 0,
        borderRadius: 20,
        backgroundColor: "#E7EEF2"
     })
}

const initialState = {
    breaktimes_list: [],
    worktime: {from: moment().startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'), to: moment().startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')},
    break_time_options: [
        {label: "No Break", value: "no_break"},
        {label: "Breakfast", value: "breakfast"},
        {label: "Morning tea", value: "morning_tea"},
        {label: "Lunch", value: "lunch"},
        {label: "Afternoon tea", value: "afternoon"},
        {label: "Dinner", value: "dinner"},
        {label: "Other", value: "other"},
    ],
    contract: {},
    schedule_options: [],

    worktimes: [],
    breaktimes: [],

    isOpen: false,
    other_breaktime: '',
    selected_break: null,
    selectedDate: moment().format('YYYY-MM-DD'),
    selected_schedule: null,
    work_time_in_schedule: 0,
    break_time_in_schedule: 0
};

class WorkingHours extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            ...initialState,
        };
        this.orderBy = "id";
    }

    componentDidMount() {
        const { location: { search}, getContractById, getWorkTimes} = this.props;
        const contractId = (new URLSearchParams(search)).get("contractId");
        const workHourId = (new URLSearchParams(search)).get("workHourId");
        const scheduleId = (new URLSearchParams(search)).get("scheduleId");

        if(contractId) {
            getContractById(contractId)
            .then(({result: {data}}) => {
                this.setState({contract: data.contract});
                let schedule_options = [];
                for(let i = 0; i < data.contract.schedules.length; i += 1) {
                    schedule_options.push({label: data.contract.schedules[i].name, value: data.contract.schedules[i]});
                }
                if(scheduleId) {
                    const selectedSchedule = schedule_options.find(el=>el.value.id == scheduleId);
                    this.setState({
                        selected_schedule: selectedSchedule?selectedSchedule.value:null
                    })
                }
                this.setState({schedule_options});
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
            
            getWorkTimes({contract_id: contractId, orderBy: this.orderBy})
            .then(({result: {data}}) => {
                let worktimes = [], breaktimes = [];
                for(let i = 0; i < data.work_times.length; i += 1) {
                    worktimes.push({id: data.work_times[i].id, from: data.work_times[i].from, to: data.work_times[i].to, schedule_id: data.work_times[i].schedule_id});
                    for(let j = 0; j < data.work_times[i].break_times.length; j += 1) {
                        breaktimes.push({id: data.work_times[i].id, from: data.work_times[i].break_times[j].from, to: data.work_times[i].break_times[j].to, schedule_id: data.work_times[i].schedule_id});
                    }
                }
                if(workHourId) {
                        this.setState({
                        worktime: worktimes.find(el=>el.id == workHourId),
                        breaktimes_list: breaktimes.filter(el=>el.id == workHourId)
                    })
                }
                this.setState({breaktimes, worktimes});                
            })
        }
    }

    selectDate = (date) => {
        this.setState({
            selectedDate: moment(date).format('YYYY-MM-DD')
        })
    }

    handleBreak = (ev) => {
        ev.preventDefault();
        let {breaktimes_list} = this.state;
        breaktimes_list.push({from: moment().format('YYYY-MM-DD'), to: moment().format('YYYY-MM-DD'), type: 'No Break'});
        this.setState({breaktimes_list});
    }

    handleRemoveBreakTime = (key) => {
        let { breaktimes_list } = this.state;
        breaktimes_list.splice(key, 1);
        this.setState({breaktimes_list});
    }

    onCancel = () => {
        this.setState({
            isOpen: false
        })
    }

    onOk = () => {
        let {selected_break, breaktimes_list, other_breaktime} = this.state;
        breaktimes_list[selected_break].type = other_breaktime;

        this.setState({
            isOpen: false,
            breaktimes_list
        })
    }

    handleInputChange = (ev) => {
        if(ev.target.id === 'other_breaktime') {
            this.setState({other_breaktime: ev.target.value})
        }
    }

    handleBreakTime = (opt, key) => {
        let {breaktimes_list} = this.state;
        if(opt.value === 'other') {
            this.setState({
                isOpen: true,
                selected_break: key
            })
        }
        breaktimes_list[key].type = opt.label;
        this.setState({breaktimes_list});
    }

    changeTimeField = (value, key, is_from) => {
        let { breaktimes_list, selectedDate} = this.state;
console.log(value)
        if(is_from){
            const from = moment(selectedDate + " " + value).format('YYYY-MM-DDTHH:mm:ssZ');
            if(breaktimes_list[key].to && !time.compareDate(from, breaktimes_list[key].to)) {
                breaktimes_list[key].to = moment(breaktimes_list[key].to).add(1, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
            }
            breaktimes_list[key].from = from;
        }else{
            const to = moment(selectedDate + " " + value).format('YYYY-MM-DDTHH:mm:ssZ');
            if(breaktimes_list[key].from && !time.compareDate(breaktimes_list[key].from, to)) {
                breaktimes_list[key].to = moment(to).add(1, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
            }else
                breaktimes_list[key].to = to;
        }
        this.setState({ breaktimes_list });
    }

    handleChangeWorkTime = (value, is_from) => {
        let { worktime, selectedDate } = this.state;
        if(is_from) {
            worktime.from = moment(selectedDate + " " + value).format('YYYY-MM-DDTHH:mm:ssZ');
            if(worktime.to && !time.compareDate(worktime.from, worktime.to)) {
                worktime.to = moment(worktime.to).add(1, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
            }
        }else{
            worktime.to = moment(selectedDate + " " + value).format('YYYY-MM-DDTHH:mm:ssZ');
            if(worktime.from && !time.compareDate(worktime.from, worktime.to)) {
                worktime.to = moment(worktime.to).add(1, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
            }
        }
        this.setState({worktime});
    }

    handleSelectSchedule = (opt) => {
        const { worktimes, breaktimes } = this.state;
        let work_time_in_schedule = 0, break_time_in_schedule = 0;
        for(let i = 0; i < worktimes.length; i += 1) {
            if(opt.value.id === worktimes[i].schedule_id)
                work_time_in_schedule += moment.duration(moment(worktimes[i].to).diff(moment(worktimes[i].from)));
        }
        for(let j = 0; j < breaktimes.length; j += 1) {
            if(opt.value.id === breaktimes[j].schedule_id)
                break_time_in_schedule += moment.duration(moment(breaktimes[j].to).diff(moment(breaktimes[j].from)));
        }

        this.setState({work_time_in_schedule, break_time_in_schedule, selected_schedule: opt.value});
    }

    handleSubmit = (ev) => {
        ev.preventDefault();
        const { createWorkTime, updateWorkTIme, history: { goBack }, location: { search} } = this.props;
        const { worktime, breaktimes_list, selected_schedule, contract } = this.state;
        if(worktime.from === null || worktime.to === null) {
            toast.warn(messages.WORK_TIME_FIELD_INCORRECT);
        }else if(selected_schedule === null) {
            toast.warn(messages.SELECT_SCHEDULE);
        }else if(!time.compareDate(worktime.from, worktime.to)) {
            toast.warn(messages.WORK_TIME_FIELD_INCORRECT);
        }else{
            const workHourId = (new URLSearchParams(search)).get("workHourId");
            if(workHourId) {
                const query = {
                    to: worktime.to,
                    from: worktime.from,
                    break_times: breaktimes_list,
                    comment: ''
                }
                updateWorkTIme(workHourId, query)
                .then(({result: {data}}) => {
                    goBack();
                }).catch(() => {
                    toast.error(messages.INTERNAL_SERVER_ERROR);
                });
            }else {
                const contract_id = contract.id;
                const schedule_id = selected_schedule.id;
                const from = worktime.from;
                const to = worktime.to;
                createWorkTime({contract_id, schedule_id, from, to, break_times: breaktimes_list})
                .then(({result: {data}}) => {
                    toast.success(messages.WORK_TIME_ADD_SUCCESS);
                    goBack();
                }).catch(() => {
                    toast.error(messages.INTERNAL_SERVER_ERROR);
                });
            }
        }
    }

    renderBreakTimeDlg() {
        const {isOpen, other_breaktime} = this.state;
        return (
            <Modal isOpen={isOpen} className="confirm-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={this.onCancel}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">{"Other BreakTime"}</h5>
                    <div className="modal-description">
                        <input type="text" className="form-control dark-input" value={other_breaktime} id="other_breaktime" onChange={this.handleInputChange}></input>
                    </div>
                    <div className="footer">
                        <button className="btn btn-outline-success" onClick={this.onCancel}>{"CANCEL"}</button>
                        <button className="btn btn-success" onClick={this.onOk}>{"OK"}</button>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    render() {
        const { breaktimes_list, schedule_options, break_time_options, selectedDate, work_time_in_schedule, break_time_in_schedule, worktime, contract, selected_schedule } = this.state;
        const { location: { search} } = this.props;
        const workHourId = (new URLSearchParams(search)).get("workHourId");
        return (
            <React.Fragment>
                <div className="page-content">
                    {this.renderBreakTimeDlg()}
                    <div className="container-fluid d-flex flex-column">
                        <form className="working-hour-container" ref={ref => this.formRef = ref} onSubmit={this.handleSubmit} noValidate>
                            <div className="content">
                                <div className="left-wrapper">
                                    <div className="card">
                                        <div className="card-body working-hour-card">
                                            <h5 className="card-title">Log Working Hours</h5>
                                            <div className="form-group row">
                                                <div className="col-12"><label>Schedule Name</label></div>
                                                <div className="col-12"><Select styles={customStyles} className="dark-input" options={schedule_options} value={schedule_options.find(el=>el.value === selected_schedule)} onChange={(opt) => this.handleSelectSchedule(opt)}></Select></div>
                                            </div>
                                            <div className="divider mt-3"></div>
                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <label>Total hours worked in this schedule</label>
                                                    <div className="schedule-work-hours">{time.hhmmss(work_time_in_schedule/1000, false)}</div>
                                                </div>
                                                <div className="col-6">
                                                    <label>Multiple break time</label>
                                                    <div className="schedule-break-hours">{time.hhmmss(break_time_in_schedule/1000, false)}</div>
                                                </div>
                                            </div>
                                            <div className="divider mt-3"/>
                                            <div className="row mt-3">
                                                <div className="col-12"><h5>Working Time</h5></div>
                                                <div className="col-12">
                                                    <div className="row mt-2">
                                                        <div className={"col-6 d-flex align-items-center justify-content-start" + (moment(moment(worktime.to).format('YYYY-MM-DD')) > moment(moment(worktime.from).format('YYYY-MM-DD'))?" mt-4":"")}>
                                                            <div className="workingtime-label mr-3">Start</div>
                                                            <TimePicker value={moment(worktime.from).format('HH:mm')} onChange={(value) => this.handleChangeWorkTime(value, true)}/>
                                                        </div>
                                                        <div className="col-6">
                                                            {moment(moment(worktime.to).format('YYYY-MM-DD')) > moment(moment(worktime.from).format('YYYY-MM-DD'))?"(Next Day)":null}
                                                            <div className="d-flex align-items-center justify-content-start">
                                                                <div className="workingtime-label mr-3">End</div>
                                                                <TimePicker value={moment(worktime.to).format('HH:mm')} onChange={(value) => this.handleChangeWorkTime(value, false)}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="divider mt-3"/>
                                            <div className="button-container mt-3"><button className="btn btn-success" id="add_break_but" onClick={this.handleBreak}>Add break time</button></div>
                                            {breaktimes_list.map((item, key) => {
                                                const option = break_time_options.find(el=>el.label === item.type);
                                                const current_break = {label: item.type, value:option?option.type:'other'}
                                                return (
                                                    <div className="row mt-3">
                                                        <div className="col-12 d-flex">
                                                            <h5>Break Time</h5>
                                                            <div className="action">
                                                                <img src="/static/images/icons/icon-delete-gray.svg" onClick={() => this.handleRemoveBreakTime(key)}></img>
                                                            </div>
                                                        </div>
                                                        <div className="col-12"><Select styles={customStyles} value={current_break} options={break_time_options} onChange={(opt) => this.handleBreakTime(opt, key)}></Select></div>
                                                        <div className="col-12">
                                                            <div className="row mt-3">
                                                                <div className={"col-6 d-flex align-items-center justify-content-start" + (moment(moment(item.to).format('YYYY-MM-DD')) > moment(moment(item.from).format('YYYY-MM-DD'))?" mt-4":"")}>
                                                                    <div className="workingtime-label mr-3">Start</div>
                                                                    <TimePicker value={moment(item.from).format('HH:mm')} onChange={(value) => this.changeTimeField(value, key, true) }/>
                                                                </div>
                                                                <div className="col-6">
                                                                    {moment(moment(item.to).format('YYYY-MM-DD')) > moment(moment(item.from).format('YYYY-MM-DD'))?"(Next Day)":null}
                                                                    <div className="d-flex align-items-center justify-content-start">
                                                                        <div className="workingtime-label mr-3">End</div>
                                                                        <TimePicker value={moment(item.to).format('HH:mm')} onChange={(value) => this.changeTimeField(value, key, false) }/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            
                                        </div>
                                    </div>
                                </div>

                                <div className="right-wrapper">
                                    <div className="card calendar-card">
                                        <div className="card-body">
                                            <Calendar date={selectedDate} onSelect={this.selectDate}></Calendar>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="footer">
                                <button type="button" className="btn btn-default mr-3"><a href={`${paths.client.APP_CONTRACTS}?contractId=${contract.id}`}>{"Cancel"}</a></button>
                                <button type="submit" className="btn btn-success">{workHourId?"Update":"Publish"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

WorkingHours.propTypes = {
    getContractById: PropTypes.func,
    getWorkTimes: PropTypes.func.isRequired,
    createWorkTime: PropTypes.func.isRequired,
    updateWorkTIme: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired
};

export default connect(
    null,
    { 
        ...actions.contracts,
        ...actions.worktime
    }
)(withRouter(WorkingHours));