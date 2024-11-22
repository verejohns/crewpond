import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from 'react-redux/es/connect/connect';
import selectors from './selectors';
import actions from '../../actions';
import { withRouter } from 'react-router-dom';
import { messages, paths, validation, time } from '../../../../../utils';
import { isEmpty, omit } from 'lodash';
import moment from 'moment';
import { JobForm, ScheduleForm, ConfirmDialog } from "../../components";
import { FormError } from '../../../components';
import {toast} from "react-toastify";

class NewJob extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            submitted: false,
            job_info: {
                title: '',
                price: 0,
                avatar: null,
                is_hourly: true,
                is_public: true,
                is_urgent: false,
                due_date: '',
                category: {},
                description: '',
                location: {address: '', place_name: '', latitude: null, longitude: null}
            },
            avatar: null,
            schedules: [],
            schedule_id: null,
            schedule: {},
            categories: [],
            edit_schedule: false,
            deleted_schedules: [],
            isOpen: false,
            // purchaseOption: [{value: "is_key_hirer", label: "Key Hirer"}, {value: "buy_connection", label: "Buy Connection"}],
            // purchase: {value: "is_key_hirer", label: "Key Hirer"},
            isEditJob: false,
            isConfirmModal: false,
            confirmSchedule: '',
            errors: {},
            submmitClicked: false,
            showScheduleForm: props.location.hash === '#add-schedule',
            recaptchaToken: ''
        };

        this.editSchedule = this.editSchedule.bind(this);
        this.deleteSchedule = this.deleteSchedule.bind(this);
        this.createSchedule = this.createSchedule.bind(this);
        this.saveSchedule = this.saveSchedule.bind(this);
        this.saveJob = this.saveJob.bind(this);
        // if(this.captchaJob) {
        //     console.log("Started, Just a second...");
        //     this.captchaJob.reset();
        // }
    }

    componentDidMount() {
        const { getCategories, getJobById, match: {params}} = this.props;
        getCategories()
        .then(({result: {data}}) => {
            const { categories } = data;
            
            let options = [];
            if(categories.length > 0){
                categories.filter(item=>item.deep === 1).map((category) => {
                    let option = {
                        label: category.main,
                        options: [],
                    };
                    const subCategories = category.sub;
                    const middleSubs = category.sub.filter((el) => categories.find((e) => e.main === el));
                    
                    if (middleSubs.length > 0) {
                        
                        for (let i = 0; i < subCategories.length; i += 1) {
                            const subCategory = categories.find(item => item.main === subCategories[i]);
                            let subOptions = [];
                            let subOptionLabel = category.main + " - " + subCategory.main;

                            const revealCategories = subCategory.sub;

                            for(let j = 0; j < revealCategories.length; j += 1){
                               
                                subOptions.push({
                                    label: revealCategories[j],
                                    value: {id: j, content: revealCategories[j], main: subOptionLabel},
                                });
                            }

                            options.push({
                                label: subOptionLabel,
                                options: subOptions
                            });
                        }
                        
                        
                    } else {
                        for(let i = 0; i < subCategories.length; i += 1){
                            option.options.push({
                                label: subCategories[i],
                                value: {id: i, content: subCategories[i], main: category.main},
                            });
                        }
                        options.push(option);
                    }
                });
            }
            this.setState({
                categories: options
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
        if(params && params.id){
            this.setState({isEditJob: true});
            getJobById(params.id)
            .then(({result: {data}}) => {
                const {job} = data;
                this.setState({
                    job_info: omit(job, ['accepted_offers', 'suggested_offers', 'user', 'number_of_offers', 'number_of_new_offers', 'createdAt']),
                    avatar: job.avatar,
                    schedules: job.schedules
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.location.pathname !== this.props.location.pathname && this.props.location.pathname === paths.client.APP_NEW_JOB) {
            location.reload();
        }

        if (prevProps.location.hash !== this.props.location.hash) {
            if (this.props.location.hash === '#add-schedule') {
                this.setState({
                    showScheduleForm: true
                })
            }
        }
    }

    // verifyCallback = (recaptchaToken) => {
    //     this.setState({recaptchaToken});
    // }

    readUploadImageFile = (inputFile) => {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = (el) => {
                resolve(el.target.result);
            }
            reader.readAsDataURL(inputFile);
        })
    }

    handleCancel = (ev) => {
        ev.preventDefault();
        const { history: {goBack} } = this.props;
        goBack();
    }

    async saveJob(data) {
        let avatar = null;
        if(data.avatar instanceof File) {
            try {
                avatar = await this.readUploadImageFile(data.avatar);
            }catch (err) {
                console.log(err)
            }
        }else {
            avatar = data.avatar;
        }
        this.setState({
            job_info: data,
            avatar
        })
    }

    validate = () => {
        const { job_info, recaptchaToken } = this.state;
        let errors = {};

        // if(!recaptchaToken || recaptchaToken.length === 0) {
        //     errors.recaptcha = "Recaptcha is invalid";
        // }
        if(isEmpty(job_info)) {
            errors.empty = 'Job info is empty';
            toast.error(errors.empty);
        }
        if (validation.isEmpty(job_info.title)) {
            errors.title = 'Please provide a title';
            toast.error(errors.title);
        }

        // if (validation.isEmpty(job_info.price) || job_info.price == '0') {
        //     errors.price = 'Please provide a price';
        //     toast.error(errors.price);
        // }

        if (parseInt(job_info.price) < 0) {
            errors.price = 'You cannot provide a negative price';
            toast.error(errors.price);
        }

        if (validation.isEmpty(job_info.description)) {
            errors.description = 'Please provide a description';
            toast.error(errors.description);
        }

        if (isEmpty(job_info.category)) {
            errors.category = 'Please select category';
            toast.error(errors.category);
        }
        this.setState({ errors });
        return errors;
    }

    handleCreateJob = (is_ext_payment, isConfirmed) => {
        const { job_info, schedules, isEditJob, deleted_schedules, recaptchaToken, isConfirmModal } = this.state;
        const { createJob, updateJob, match: {params}, history: {push}, getBadgeCount } = this.props;
        let formData = new FormData();
        this.setState({submmitClicked: true});
        if(isEmpty(this.validate())) {
            if(isEditJob) {
                for(let key in job_info){
                    if(key === 'avatar')
                        formData.append('avatar', job_info[key]);
                    else if(key === 'category')
                        formData.append(key, JSON.stringify([job_info[key]]));
                    else if(key === 'location')
                        formData.append(key, JSON.stringify(job_info[key]));
                    else if(key !== 'schedules')
                        formData.append(key, job_info[key]);
                }

                if(schedules.length > 0){
                    formData.append('schedules', JSON.stringify(schedules));
                } else {
                    toast.error("You must add at least one schedule to your job!");
                    return;
                }

                if(deleted_schedules.length > 0) {
                    formData.append('deleted_schedules', JSON.stringify(deleted_schedules));
                    formData.append('unassign_schedules', isConfirmed)
                }
               
                // formData.append('recaptchaToken', recaptchaToken);
                updateJob(params.id, formData)
                .then(({result: {data}}) => {
                    let {job} = data;
                    console.log("Job edited successfully");
                    job.category = job.category[0];
                    this.setState({
                        job_info: job,
                    });
                    toast.success(messages.UPDATE_JOB_SUCCEED);
                    // if(this.captchaJob) {
                    //     console.log("Started, Just a second...");
                    //     this.captchaJob.reset();
                    // }
                    let startDate = null;
                    if(schedules.length > 0 && schedules[0].time_field.length > 0) {
                        startDate = "&startDate=" + encodeURIComponent(moment(schedules[0].time_field[0].from).format('YYYY-MM-DD'));
                    }else{
                        startDate = "&startDate=" + encodeURIComponent(moment().format('YYYY-MM-DD'));
                    }
                    push(`${paths.client.APP_SCHEDULE}?jobId=${job.id}${startDate}&viewMode=week`);
                    
                }).catch(({response: {data}}) => {
                   
                    if(data.errorCode === 27) {
                        // if(this.captchaJob) {
                        //     console.log("Started, Just a second...");
                        //     this.captchaJob.reset();
                        // }
                        
                        return toast.error(messages.RECAPTCHA_ERROR);

                    }else if(data.errorCode === 71){
                        let assigned_schedules = "";
                        if (data.schedules && data.schedules.length > 0) {
                            data.schedules.forEach((schedule, index, array) => {
                                assigned_schedules += " " + schedule.name;
                                if (index !== (array.length - 1)) {
                                    assigned_schedules += ","
                                } else {
                                    assigned_schedules += "?"
                                }
                            })
                        }

                        let confirmScheduleMessage = messages.DELETE_ASSIGNED_SCHEDULE_CONFIRM + assigned_schedules;
  
                        this.setState({confirmSchedule: confirmScheduleMessage, isConfirmModal: true});

                    } else {
                        // if(this.captchaJob) {
                        //     console.log("Started, Just a second...");
                        //     this.captchaJob.reset();
                        // }
                        toast.error(messages.UPDATE_JOB_FAILED);
                    }
                        
                    
                });
            }else {
                formData.append('is_ext_payment', is_ext_payment);
                for(let key in job_info){
                    if(key === 'avatar')
                        formData.append('avatar', job_info[key]);
                    else if(key === 'category' || key === "location")
                        formData.append(key, JSON.stringify([job_info[key]]));
                    else if(key === 'location')
                        formData.append(key, JSON.stringify(job_info[key]));
                    else
                        formData.append(key, job_info[key]);
                }

                if(schedules.length > 0){
                    formData.append('schedules', JSON.stringify(schedules));
                } else {
                    toast.error("You must add at least one schedule to your job!");
                    return;
                }
                // formData.append('recaptchaToken', recaptchaToken);
                createJob(formData)
                .then(({result: {data}}) => {
                    let {job} = data;
                    job.category = job.category[0];
                    this.setState({
                        job_info: job,
                        submitted: true
                    })
                    getBadgeCount();
                    // if(this.captchaJob) {
                    //     console.log("Started, Just a second...");
                    //     this.captchaJob.reset();
                    // }
                }).catch(({response: {data}}) => {
                    // if(this.captchaJob) {
                    //     console.log("Started, Just a second...");
                    //     this.captchaJob.reset();
                    // }
                    if(data.errorCode === 27)
                        return toast.error(messages.RECAPTCHA_ERROR);
                    toast.error("Failed to create the job.");
                });
            }
        }
    }

    updateSchedule = (data) => {
        let { job_info } = this.state;

        let schedule = data;

        if (!schedule) {
            schedule = {
                name: '',
                description: '',
                time_field: []
            }
        } 
        
        if (!schedule.name) {
            schedule.name = '';
        }

        if (!schedule.description) {
            schedule.description = '';
        }

        if (!schedule.time_field) {
            schedule.time_field = [];
        }

        if(schedule.time_field.length > 0) {
            let endSchedule = schedule.time_field[0].to;
            // for(let i = 0; i < data.time_field.length; i += 1) {
            //     if(time.compareDate(endSchedule, data.time_field[i].to)) {
            //         endSchedule = data.time_field[i].to;
            //     }
            // }
            //
            if(!job_info.due_date || time.compareDate(job_info.due_date, endSchedule)){
                job_info.due_date = endSchedule;
            }
        }

        this.setState({
            schedule,
            job_info
        });
    }

    saveSchedule(data, is_save) {
        const { edit_schedule, schedule_id, job_info } = this.state;
        let { schedules } = this.state;
        if(is_save){
            if(edit_schedule){
                schedules[schedule_id] = data;
            }else{
                schedules.push(data);
            }
        }

        if(schedules.length > 0) {
            let endSchedule = schedules[0].time_field[0].to;
            // for(let i = 0; i < schedules.length; i += 1) {
            //     for(let j = 0; j < schedules[i].time_field.length; j += 1) {
            //         if(time.compareDate(endSchedule, schedules[i].time_field[j].to)) {
            //             endSchedule = schedules[i].time_field[j].to;
            //         }
            //     }
            // }
            //
            if(!job_info.due_date || time.compareDate(job_info.due_date, endSchedule)){
                job_info.due_date = endSchedule;
                this.setState({job_info})
            }
        }


        this.setState({
            schedules,
            schedule_id: null,
            schedule: {
                name: '',
                description: '',
                time_field: []
            },
            showScheduleForm: false
        })
    }

    editSchedule(schedule, id) {
        this.setState({
            schedule_id: id,
            schedule: schedule,
            edit_schedule: true,
            showScheduleForm: true
        });
    }

    deleteSchedule(schedule, key) {
        let {schedules, deleted_schedules} = this.state;
        schedules = schedules.filter((el) => {
            if(el !== schedule)
                return true;
            else
                return false;
        });
        if(schedule.id) {
            deleted_schedules.push(schedule.id);
        }
        this.setState({schedules, deleted_schedules});
    }

    createSchedule() {
        this.setState({
            schedule: {
                name: '',
                description: '',
                time_field: []
            },
            edit_schedule: false,
            showScheduleForm: true
        });
    }

    // selectPurchase = (opt) => {
    //     this.setState({
    //         purchase: opt
    //     });
    // }

    // handlePurchase = () => {
    //     const { purchase } = this.state;
    //     const { createKeyHirer } = this.props;
    //     if(purchase.value === 'buy_connection') {
    //         this.handleCreateJob(true);
    //     }else {
    //         createKeyHirer()
    //         .then(() => {
    //             toast.success(messages.KEY_HIRER_SUCCESS);
    //         }).catch(() => {
    //             toast.error(messages.INTERNAL_SERVER_ERROR);
    //         })
    //     }

    //     this.setState({isOpen: false})
    // }

    handleInvite = (ev) => {
        const { history: {push} } = this.props;
        if(ev.target.id === "invite_jobbers"){
            const { job_info } = this.state;
            push(`${paths.client.APP_INVITES_REQUEST}?jobId=${job_info.id}`);
        }else if (ev.target.id === 'no_invite_jobbers'){
            push(paths.client.APP_JOBS);
        }
    }

    // renderPurchaseDialog () {
    //     const { isOpen, purchaseOption, purchase } = this.state;
    //     return (
    //         <Modal isOpen={isOpen} className="new-job-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
    //             <div className="modal-dialog-header">
    //                 <img src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isOpen: false})}/>
    //             </div>

    //             <ModalBody>
    //                 <h5 className="modal-title text-center">Purchase</h5>
    //                 <div className="info mt-3">You already posted 2 tasks this month. You need to purchase to continue</div>
    //                 <Select
    //                     className="select-purchase mt-3"
    //                     multi
    //                     styles={customStyles}
    //                     name="filters"
    //                     value={purchase}
    //                     options={purchaseOption}
    //                     onChange={this.selectPurchase}
    //                 />
    //                 <div className="footer">
    //                     <button className="btn btn-outline-success" onClick={() => this.setState({isOpen: false})}>Cancel</button>
    //                     <button className="btn btn-success" onClick={this.handlePurchase}>Purchase</button>
    //                 </div>
    //             </ModalBody>
    //         </Modal>
    //     )
    // }

    render() {
        const { submitted, showScheduleForm, submmitClicked, job_info, avatar, schedules, categories, edit_schedule, confirmSchedule, isConfirmModal, errors } = this.state;
        const { match: {params} } = this.props;
        return (
            <React.Fragment>
                <div className="page-content">
                    <div className="container-fluid d-flex">
                        {/* {this.renderPurchaseDialog()} */}
                        <ConfirmDialog isOpen={isConfirmModal} description={confirmSchedule} ok="Yes" cancel="No" onOk={() => this.handleCreateJob(null, true)} onCancel={() => {this.setState({isConfirmModal: false});location.reload();}}/>
                        <div className="job-form-content">
                            <div className="row">
                                <div className="col-12">
                                    {submitted?
                                        <div className="job-success-card">
                                            <div className="job-post-success">
                                                <img src="/static/images/congratulation.png"></img>
                                                <h2>Great !</h2>
                                                <span>New Job Posted</span>
                                                <span>{job_info.title}</span>
                                            </div>

                                            <div className="row mt-5">
                                                <div className="col-12 text-center">
                                                    <button className="btn btn-success" id="invite_jobbers" onClick={this.handleInvite}>Invite</button>
                                                    <button className="btn btn-success ml-3" id="no_invite_jobbers" onClick={this.handleInvite}>Don't Invite</button>
                                                </div>
                                            </div>
                                        </div>:
                                        <div className="card-wrapper">
                                            <div className="card job-form-card">
                                                <div className="card-body">
                                                    <JobForm submmitClicked={submmitClicked} avatar={avatar} data={job_info} errors={errors} isEdit={params && params.id ?false:true} schedules={schedules} categories={categories}
                                                        onChange={this.saveJob} onEditSchedule={this.editSchedule} onDeleteSchedule={this.deleteSchedule} onAddSchedule={this.createSchedule}/>
                                                </div>
                                            </div>
                                            {showScheduleForm?
                                            <div className="card schedule-form-card">
                                                <div className="card-body">
                                                    <ScheduleForm data={this.state.schedule} isEdit={edit_schedule} job={job_info} onUpdate={this.updateSchedule} onSubmit={this.saveSchedule}/>
                                                </div>
                                            </div>:null}
                                        </div>
                                    }
                                </div>
                            </div>
                            {!submitted && !showScheduleForm?<div className="row mt-5">
                                <div className="col-xl-8 col-lg-6 col-md-12 col-sm-12 mb-3 d-flex flex-column align-items-center">
                                    {/* <ReCAPTCHA
                                        className="recaptcha"
                                        ref={(el) => {this.captchaJob = el;}}
                                        size="normal"
                                        type="image"
                                        sitekey={process.env.RECAPTCHA_SITE_KEY}
                                        onChange={this.verifyCallback}
                                    /> */}
                                    <FormError show={submmitClicked} error={errors.recaptcha} />
                                </div>
                                <div className="col-xl-2 col-lg-3 col-md-6 col-sm-6">
                                    <button type="button" className="btn btn-default btn-block" onClick={this.handleCancel}>{"Cancel"}</button>
                                </div>
                                <div className="col-xl-2 col-lg-3 col-md-6 col-sm-6">
                                    <button type="button" className="btn btn-success btn-block" onClick={() => this.handleCreateJob(false, false)}>{params && params.id ?"Update":"Publish"}</button>
                                </div>
                            </div>:null}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

NewJob.propTypes = {
    getJobById: PropTypes.func,
    createJob: PropTypes.func,
    createKeyHirer: PropTypes.func,
    updateJob: PropTypes.func,
    getCategories: PropTypes.func.isRequired,
    match: PropTypes.shape({
        params: PropTypes.string
    }).isRequired
};

export default connect(
    selectors,
    {
        ...actions.jobs,
        ...actions.categories,
        ...actions.subscription,
        ...actions.notifications
    }
)(withRouter(NewJob));
