import React, { Component } from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import selectors from './selectors';
import actions from '../../../actions';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { set, isEmpty, merge, omit } from 'lodash';
import { validation } from '../../../../../../utils';

import { ImageUpload, Select, EditableField, Switch, UserDetailCard } from "../../../components";
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";

class EditJob extends Component {
    constructor() {
        super();
        this.state = {
            user: {},
            schedules: [],
            categoryOptions: [],
            category: null,
            job: {},
            query: {},
            hourly: [{value: "hourly", label: "Hourly"}, {value: "fixed", label: "Fixed"}],
            sel_hr: {},
            is_edit_schedule: false,
            is_create_schedule: false,
            edit_schedule: {},
            edit_id: null,
            time_field: [],
            avatar: null,
            deleted_schedules: []
        }

        this.autocomplete = null
        this.handlePlaceSelect = this.handlePlaceSelect.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleScheduleEdit = this.handleScheduleEdit.bind(this);
        this.handleScheduleTime = this.handleScheduleTime.bind(this);
        this.handleRemoveTime = this.handleRemoveTime.bind(this);
        this.handleSaveSchedule = this.handleSaveSchedule.bind(this);
        this.handleCreateSchedule = this.handleCreateSchedule.bind(this);
        this.handleAddTime = this.handleAddTime.bind(this);
        this.toggleSOSJob = this.toggleSOSJob.bind(this);
        this.togglePublic = this.togglePublic.bind(this);
        this.selectHourly = this.selectHourly.bind(this);
        this.validate = this.validate.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onAvatarChange = this.onAvatarChange.bind(this);
    }

    componentDidMount() {
        const { getJob, getCategories, match: {params: {id}} } = this.props;
        const self = this;
        setTimeout(function(){ 
            const element = document.getElementById('autocomplete');
            self.autocomplete = new google.maps.places.Autocomplete(element, {})
    
            self.autocomplete.addListener("place_changed", self.handlePlaceSelect)
                
        }, 1000);

        getJob(id)
        .then(({result: {data}}) => {
            this.setState({
                job: omit(data.job, ['user']),
                user: data.job.user,
                schedules: data.job.schedules?data.job.schedules:[],
                offers: data.offers
            });
        });

        getCategories()
        .then(({result: {data}}) => {
            const { categories } = data;
            let categoryOptions = []
            if(categories.length > 0){
                categories.map((category) => {
                    let option = {
                        label: category.main,
                    }

                    let subOptions = []
                    const subCategories = category.sub;
                    for(let i = 0; i < subCategories.length; i += 1){
                        subOptions.push({
                            label: subCategories[i],
                            value: {id: category.refId, content: subCategories[i]},
                        });
                    }

                    option.options = subOptions;
                    categoryOptions.push(option);
                })
            }
            this.setState({
                categoryOptions: categoryOptions
            })
        }).catch(({response: {data}}) => {
            toast.error(data.msg, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
            });
        });
    }

    onAvatarChange (e) {
        let { query, job } = this.state;
        const mediaFile = e.target.files[0];
        merge(query, {
            avatar: mediaFile
        });
        
        this.setState({
            query: query
        })

        let reader = new FileReader();
        reader.onloadend = (el) => {
            job.avatar = el.target.result;
            this.setState({
                job: job
            })
        }

        reader.readAsDataURL(mediaFile);
    }

    handleSaveSchedule() {
        let { schedules, is_create_schedule, is_edit_schedule, edit_schedule, time_field } = this.state;

        if(validation.isEmpty(edit_schedule.name)){
            toast.warn('You need to input schedule name');
            return;
        }

        merge(edit_schedule, {
            time_field: time_field
        })
        if(is_create_schedule){
            schedules.push(edit_schedule);
        }else if(is_edit_schedule && edit_schedule.id){
            const id = schedules.findIndex(el=>el.id === edit_schedule.id);
            schedules[id] = edit_schedule;
        }

        this.setState({
            time_field: [],
            schedules: schedules,
            is_edit_schedule: false,
            is_create_schedule: false
        })
    }

    handleCreateSchedule() {
        const { edit_schedule, is_edit_schedule, is_create_schedule } = this.state;
        if(is_edit_schedule || is_create_schedule){
            toast.warn("You need to save current schedule before create new schendule");
            return;
        }

        this.setState({
            is_create_schedule: true,
            edit_schedule: {name: '', description: ''},
            time_field: []
        })
    }

    handleAddTime() {
        let { time_field } = this.state;
        time_field.push({from: null, to: null});
        this.setState({
            time_field: time_field
        })
    }

    handleRemoveTime(id) {
        let { time_field } = this.state;
        time_field.splice(id);
        this.setState({
            time_field: time_field
        });
    }

    handleScheduleTime(id, type, selectedDate) {
        let { time_field } = this.state;
        time_field[id][type] = selectedDate;

        this.setState({
            time_field: time_field
        })
    }

    handleEditSchedule(schedule) {
        this.setState({
            is_edit_schedule: true,
            edit_schedule: schedule,
            time_field: schedule.time_field
        })
    }

    handleRemoveSchedule(schedule) {
        let { deleted_schedules } = this.state;
        deleted_schedules.push(schedule.id);

        this.setState({
            schedules: this.state.schedules.filter(el=>el.id !== schedule.id),
            deleted_schedules: deleted_schedules
        })
    }

    handleSubmit() {
        if (event) {
            event.preventDefault();
        }
        const { updateJob } = this.props;
        const { job, query, schedules, deleted_schedules } = this.state;

        if(schedules && schedules.length > 0) {
            query.schedules = JSON.stringify(schedules);
        }

        if(deleted_schedules.length > 0) {
            query.deleted_schedules = JSON.stringify(deleted_schedules);
        }

        if (isEmpty(this.validate())) {
            updateJob(job.id, query)
            .then(() => {
                toast.success("Success", {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false,
                });
            }).catch(() => {
                toast.error("Failed to save schedule", {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false,
                });
            });
        }
    }

    validate() {
        const { job: { title, description, price } } = this.state;
    
        const errors = {};
    
        if (validation.isEmpty(title)) {
          errors.title= 'Please provide a Title';
        }
    
        if (validation.isEmpty(description)) {
          errors.description = 'Please provide a description';
        }

        if (validation.isEmpty(price)) {
            errors.price = 'Please provide a price';
        }else if(!validation.isEmpty(price)) {
            if(!validation.isNumber(price + '')) {
                errors.price = 'Invalid price';
            }
        }
        this.setState({ errors });
        return errors;
    }

    selectHourly(opt) {
        let { job, query } = this.state;
        if(opt.value === 'hourly'){
            set(job, 'is_hourly', true);
        }
        if(opt.value === 'fixed'){
            set(job, 'is_hourly', false);
        }

        
        merge(query, {
            is_hourly: job.is_hourly
        });

        this.setState({
            job: job,
            query: query
        });
    }

    togglePublic(checked) {
        let { job, query } = this.state;
        set(job, 'is_public', !checked);
        merge(query, {
            is_public: !checked
        });

        this.setState({
            job: job,
            query: query
        });
    }

    toggleSOSJob(checked) {
        let { job, query } = this.state;
        set(job, 'is_urgent', checked);
        merge(query, {
            is_urgent: checked
        });

        this.setState({
            job: job,
            query: query
        });
    }

    handleScheduleEdit(event) {
        let { edit_schedule } = this.state;
        const id = event.target.id;

        set(edit_schedule, id, event.target.value);
        this.setState({ 
            edit_schedule: edit_schedule
        });
    }

    handlePlaceSelect() {
        let addressObject = this.autocomplete.getPlace()
        let {job, query} = this.state;

        let address = addressObject.address_components;
        let location = {};
        location.address = addressObject.name;
        for(let i = 0; i < address.length; i += 1) {
            location.place_name += address[0].long_name + " ";
        }
        location.latitude = addressObject.geometry.location.lat();
        location.longitude = addressObject.geometry.location.lng();

        set(job, 'location', location);

        query.location = JSON.stringify(job.location);
        this.setState({job, query});
    }    

    handleInputChange(event) {
        let { job, query } = this.state;
        const id = event.target.id;

        set(job, id, event.target.value);
        merge(query, {
            [id]: event.target.value
        })        

        this.setState(
            { job, query },
            () => this.validate(),
        );
    }

  renderJobForm() {
    const { job, hourly, schedules } = this.state;

    return (
        <div className="card job-form-card">
            <div className="card-body">
                <form>
                    <div className="card-header">
                        <ImageUpload
                            avatar={job.avatar}
                            name="image"
                            onChange={this.onAvatarChange}
                        />

                        <div className="primary-info">
                            <div className="info-item">
                                <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                <input type="number" className="dark-input sm-input show-on-edit input-field" value={job.price} placeholder="Price" id="price" onChange={this.handleInputChange} />
                            </div>
                            <div className="info-item">
                                <img src="/static/images/icons/icon-hourglass-green.svg" alt="" />
                                <Select
                                    options={hourly}
                                    name="type"
                                    value={job.is_hourly?[hourly[0]]:[hourly[1]]}
                                    dark
                                    small
                                    onChange={this.selectHourly}
                                />
                            </div>
                            <div className="info-item">
                                <img src="/static/images/icons/icon-location-green.svg" alt="" />
                                <input id="autocomplete" type="text" ref="input" value={job.location?job.location.address:null} className="dark-input sm-input show-on-edit input-field" placeholder="Enter Location" />
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="row">
                            <div className="col-12 mb-4">
                                <EditableField type="2">
                                    <div className="section-header">
                                        <h4>Job Title</h4>
                                        <div className="action" />
                                    </div>

                                    <div className="static-field-wrap">
                                        <span className="static-field">{job.title}</span>
                                    </div>
                                    <input type="text" className="form-control show-on-edit input-field" value={job.title} defaultValue="Entertaining"  id="title" onChange={this.handleInputChange} />
                                </EditableField>
                            </div>
                            <div className="col-12 mb-5">
                                <EditableField type="2">
                                    <div className="section-header">
                                        <h4>Job Description</h4>
                                        <div className="action" />
                                    </div>

                                    <div className="static-field-wrap text-justify">
                                        <p className="static-field">
                                            {job.description}
                                        </p>
                                    </div>
                                    <textarea className="form-control show-on-edit input-field" rows={6} value={job.description}  id="description" onChange={this.handleInputChange}/>
                                </EditableField>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <div className="section-header">
                                    <h4>Schedules</h4>

                                    <div className="editable-field second-type" onClick={this.handleCreateSchedule}>
                                        <div className="action">
                                            <img src="/static/images/icons/icon-new-green.svg" alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="schedule-list">
                                    {schedules.map((schedule, key) => {
                                        const time_field = schedule.time_field;
                                        return (
                                            <div className="schedule" key={key}>
                                                <div className="name">
                                                    <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                                                    <span>{schedule.name}</span>
                                                </div>
                                                <div className="date-action">
                                                    <span>{time_field[0].from && moment(time_field[0].from).format('DD MMM YY')} - {time_field[time_field.length-1].to && moment(time_field[time_field.length-1].to).format('DD MMM YY')}</span>
                                                    <i className="fa fa-pencil" onClick={() => this.handleEditSchedule(schedule)}/>
                                                    <i className="fa fa-times" onClick={() => this.handleRemoveSchedule(schedule)}/>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <div className="col-6 col-lg-3">
                                <h4>SOS <span className="font-weight-light">Urgent Staff</span></h4>
                            </div>
                            <div className="col-6 col-lg-3">
                                <Switch checked={job.is_urgent} name="isUrgent" onChange={this.toggleSOSJob}/>
                            </div>
                            <div className="col-6 col-lg-3">
                                <h4>Private</h4>
                            </div>
                            <div className="col-6 col-lg-3">
                                <Switch checked={!job.is_public} name="isPrivate" onChange={this.togglePublic}/>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    )
  }

  renderEditScheduleForm() {
      const { edit_schedule, time_field } =this.state;

      return (
        <div className="col-lg-12">
            <div className="card schedule-card">
                <div className="card-body">
                    <input type="text" className="form-control input-field" value={edit_schedule.name} defaultValue="Entertaining"  id="name" onChange={this.handleScheduleEdit} />
                    <textarea className="form-control input-field schedule-description" rows={6} value={edit_schedule.description}  id="description" onChange={this.handleScheduleEdit}/>
                    {/* TODO: update to use component */}
                    <div className="schedule-list">
                        {time_field.map((time, index, key) => {
                            return (
                                <div className="schedule">
                                    <div className="name">
                                        <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                                        <DatePicker
                                            dateFormat="dd MMM yy h:mm aa"
                                            className="form-control lg-input input-field"
                                            selected={time.from?new Date(time.from):null}
                                            onChange={(e) => this.handleScheduleTime(index, 'from', e)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="time"
                                        />
                                    </div>
                                    <div className="date-action">
                                        <DatePicker
                                            dateFormat="dd MMM yy h:mm aa"
                                            className="form-control lg-input input-field"
                                            selected={time.to?new Date(time.to):null}
                                            onChange={(e) => this.handleScheduleTime(index, 'to', e)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="time"
                                        />
                                        <i className="fa fa-times" onClick={() => this.handleRemoveTime(index)}/>
                                    </div>
                                </div>    
                            )
                        })}
                        <div className="action" onClick={this.handleAddTime}>
                            <img src="/static/images/icons/icon-new-green.svg" alt="" />
                        </div>
                    </div>
                    
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-12 col-md-6">
                    <button type="button" className="btn btn-outline btn-block" onClick={() => this.setState({is_edit_schedule: false, is_create_schedule: false})}>Cancel</button>
                </div>
                <div className="col-12 col-md-6">
                    <button type="button" className="btn btn-primary btn-block" onClick={this.handleSaveSchedule}>Save</button>
                </div>
            </div>
        </div>
      )
  }

  render() {
    const { user, is_edit_schedule, is_create_schedule } = this.state;

    return (
      <div className="animated fadeIn">
        <ToastContainer/>
        <div className="row">
          <div className="col-lg-8 mb-8 mt-lg-0">
            {this.renderJobForm()}

            <div className="row mt-5">
                <div className="offset-md-4 col-md-4">
                </div>
                <div className="col-md-4">
                    <button type="button" className="btn btn-primary btn-block" onClick={this.handleSubmit}>Save</button>
                </div>
            </div>
        </div>

        <div className="col-lg-4">
          <UserDetailCard data={user}/>
          {is_edit_schedule || is_create_schedule?this.renderEditScheduleForm():null}
        </div>
      </div>
      </div>

    );
  }
}

EditJob.defaultProps = {
    categories: []
};

EditJob.propTypes = {
    getJob: PropTypes.func.isRequired,
    updateJob: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    isUpdatingJob: PropTypes.bool.isRequired,
    categories: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
};


export default connect(
    selectors,
    {
        ...actions.jobs,
        ...actions.category
    },
)(withRouter(EditJob));