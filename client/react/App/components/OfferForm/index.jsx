import React, { Component } from "react";
import DatePicker from "react-datepicker";
import ScheduleItem from "../ScheduleItem";
import { toast } from "react-toastify";
import { Loader } from "../../../components";

import connect from "react-redux/es/connect/connect";
import PropTypes from "prop-types";
import selectors from "./selectors";
import actions from "../../actions";
import moment from 'moment';
import { functions, messages, time, constant } from "../../../../../utils";
import { isEmpty } from 'lodash';

import "react-datepicker/dist/react-datepicker.css";

class OfferForm extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            dueDate: null,
            scheduleSelected: [],
            verificationStatus: 'inactive',
            offerSchedules: [],
            errors: {}
        };
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    checkVerified() {
        const { checkAccountVerified } = this.props;

        checkAccountVerified()
        .then((res) => {
            this.setState({
                verificationStatus: res.result.data
            });

        }).catch(({ response: { data } }) => {
            console.log(data.errorMessage);
        });
    }

    componentDidMount() {
        const { job, jobId, getJobById, invite } = this.props;
        getJobById(jobId)
        .then(({result: {data}}) => {
            if (data.job?.is_urgent) {
                this.checkVerified();
            }

            this.removeAcceptedOfferSchedue(data.job, invite);
        });

        this.setState({
            dueDate: moment(moment(), 'DD/MM/YYYY').toDate()
        })
    }

    validate = () => {
        const { scheduleSelected } = this.state;
        let errors = {};
        if(isEmpty(scheduleSelected)) {
            errors.empty = 'Please select at least one schedule';
            toast.error(errors.empty);
        }
        this.setState({ errors });
        return errors;
    }


    handleSubmit = (ev) => {
        ev.preventDefault();
        if (isEmpty(this.validate())) {
            const { isSubmitting, createOffer, onSubmit, job } = this.props;
            const { scheduleSelected, dueDate, verificationStatus } = this.state;

            if (isSubmitting)
                return;

            if (job.is_urgent && verificationStatus != 'active') {
                if (onSubmit) {
                    onSubmit(false);
                }
                return toast.error(messages.SOS_NO_BANK_OR_VERIFIED_ID);
            }

            this.formRef.classList.add('was-validated');
            if (this.formRef.checkValidity()) {
                let params = functions.parseFormData(new FormData(this.formRef));
                params = {
                    is_hourly: job.is_hourly,
                    job_id: job.id,
                    schedule_ids: scheduleSelected,
                    ...params
                };

                params.due_date = dueDate;

                if ((job.schedules.length > 0 && scheduleSelected) || job.schedules.length === 0) {
                    createOffer(params).then(() => {
                        if (onSubmit) {
                            onSubmit(true);
                        }
                        toast.success(messages.OFFER_SUCCESS);
                    }).catch(({ response: { data } }) => {
                        if (onSubmit) {
                            onSubmit(false);
                        }
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                    });
                }
            }
        }
    };

    handleDueDateChange = (selectedDate) => {
        this.setState({
            dueDate: moment(selectedDate, 'DD/MM/YYYY').toDate()
        })
    };

    handleScheduleClick = (id) => {
        let { scheduleSelected } = this.state;

        if (scheduleSelected.includes(id)) {
            scheduleSelected = scheduleSelected.filter(value => {
                return value !== id
            });
        } else {
            scheduleSelected.push(id);
        }

        this.setState({
            scheduleSelected
        });
    };

    removeAcceptedOfferSchedue(job) {
        const {invite} = this.props;
        if(job) {
            let filteredSchedules = [];
            const schedulesToDisplay = invite ? this.getInvitedSchedules(job.schedules, invite) : job.schedules;
            schedulesToDisplay.map(jobSchedule => {
                if (job.accepted_offers.length > 0) {
                    const acceptedOffer = this.getMatchedAcceptedOfferSchedule(jobSchedule.id, job.accepted_offers)
                    if(acceptedOffer) {
                        if(this.authUser.id != acceptedOffer.jobber_id) {
                            filteredSchedules.push(jobSchedule)
                        }
                    } else {
                        filteredSchedules.push(jobSchedule)
                    }
                } else {
                    filteredSchedules.push(jobSchedule)
                }
            })
            this.setState({
                offerSchedules: filteredSchedules
            })
        }
    }

    getMatchedAcceptedOfferSchedule(scheduleId, acceptedOffers) {
        const matchedOffer = acceptedOffers.filter(offer => {
             if (offer.schedule_ids.includes((scheduleId).toString())) {
                 return offer
            }
        })
        return matchedOffer[0];
    }
    
    getInvitedSchedules(jobSchedules, invite){
        const schedules = [];
        jobSchedules.map(schedule => {
            if(invite.schedule_ids.includes((schedule.id).toString())) {
                schedules.push(schedule);
            }
        })
        return schedules;
    }

    render() {
        const { job, isLoading, history } = this.props;
        const { dueDate, scheduleSelected, offerSchedules } = this.state;
        if (isLoading || !job) {
            return (
                <Loader />
            );
        }

        return (
            <form ref={ref => this.formRef = ref} className="offer-form" onSubmit={this.handleSubmit} noValidate>
                <section>
                    <div className="flex-wrapper">
                        <div className="left-wrapper">
                            <div className="category">
                                <span>Category: </span>
                                <span>{job.category.sub}</span>
                            </div>
                            <h5 className="title">{job.title}</h5>
                        </div>

                        <div className="right-wrapper">
                            {!job.is_public && (
                                <span className="badge badge-dark">Private</span>
                            )}
                            {job.is_urgent && (
                                <span className="badge badge-danger">SOS</span>
                            )}
                        </div>
                    </div>
                    <div className="description">
                        {job.description}
                    </div>
                </section>
                <hr />
                <section>
                    <h5>Offer</h5>
                    <div className="row">
                        <div className="col-6 form-group">
                            <div className="input-with-icon">
                                <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                <input type="text" name="price" className="form-control dark-input sm-input" defaultValue={job.price} required/>
                            </div>
                        </div>
                        <div className="col-6 form-group" hidden>
                            <div className="input-with-icon">
                                <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                <DatePicker
                                    value = {moment(moment(), 'DD/MM/YYYY').toDate()}
                                    name='due_date'
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-input sm-input"
                                    selected={dueDate}
                                    onChange={this.handleDueDateChange}
                                    required
                                    autoComplete='off'
                                />
                            </div>
                        </div>
                    </div>

                    <h5>Cover Letter</h5>
                    <div className="row">
                        <div className="col-12 form-group">
                            <textarea name="cover_letter" className="form-control dark-input auto-expand" data-min-rows="5" data-max-rows="5" rows="5"/>
                        </div>
                    </div>
                </section>
                {offerSchedules.length > 0 && (
                    <React.Fragment>
                        <hr />
                        <section>
                            <h5>Schedules</h5>
                            <div className="schedule-list">
                                {offerSchedules.map(item => {
                                    return (
                                        <ScheduleItem
                                            history={history}
                                            jobId={job.id}
                                            type={2}
                                            data={item}
                                            selected={scheduleSelected.includes(item.id)}
                                            onClick={this.handleScheduleClick}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    </React.Fragment>
                )}
                <div className="footer">
                    <button className="btn btn-success" type="submit">Send</button>
                </div>
            </form>
        );
    }
}

OfferForm.propTypes = {
    jobId: PropTypes.object,
    isLoading: PropTypes.bool,
    getJobById: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    createOffer: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    verifyUserAccount: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors,
    {
        ...actions.jobs,
        ...actions.offers,
        ...actions.payments
    }
)(OfferForm);
