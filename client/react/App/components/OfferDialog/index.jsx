import React, { Component } from "react";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import actions from "../../actions";
import moment from 'moment';
import { Link } from "react-router-dom";
import { functions, messages, paths, constant, time } from '../../../../../utils';

import ScheduleItem from "../ScheduleItem";
import { Modal, ModalBody} from 'reactstrap';
import { toast } from 'react-toastify';
import { Loader, Score } from "../../../components";

class OfferDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offer: null, 
            isLoading: false,
            editOffer: false,
            dueDate: null,
            jobSchedules: [],
            scheduleSelected: []
        }
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
        this.paymentMethod = JSON.parse(localStorage.getItem(constant.PAYMENT_METHOD));
        this.isJobOwner = false;
        this.handleEditOfferClick = this.handleEditOfferClick.bind(this);
        this.handleScheduleClick = this.handleScheduleClick.bind(this);
    }
    componentDidMount() {
        this.getOfferDetail();

        this.setState({
            dueDate: moment(moment(), 'DD/MM/YYYY').toDate()
        })
    }

    getOfferDetail = () => {
        const {parentJob, getOfferById, id} = this.props;
        this.setState({isLoading: true});
        getOfferById(id)
        .then(({result: {data}}) => {
            console.log('Offer detail->', data.offer);
            this.isJobOwner = data.offer.job.user.id == this.authUser.id;
            let due_date = moment();
            if (data.offer.due_date) {
                due_date = data.offer.due_date;
            }
            this.setState({
                isLoading: false,
                offer: data.offer,
                dueDate: due_date,
                jobSchedules: parentJob.schedules,
                scheduleSelected: data.offer.schedules
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
            this.setState({
                isLoading: false,
                offer: null
            })
        })
    }

    handleEditOfferClick = () => {
        const { editOffer } = this.state;

        this.setState({
            editOffer: !editOffer
        })
    }

    handleDeleteOffer = (ev) => {
        ev.preventDefault();

        const { deleteOffer, id, handleClose, editOnLoad } = this.props;

        deleteOffer(id).then(() => {
            toast.success("Offer deleted successfully");
            
            if (editOnLoad) {
                handleClose();
            } else {
                this.setState({
                    editOffer: false
                })
            }

            location.href = paths.client.APP_OFFERS
        }).catch((error) => {
            console.log(error);
            toast.error(messages.INTERNAL_SERVER_ERROR);
            
        });
    };

    handleUpdateOffer = (ev) => {
        ev.preventDefault();

        const { isSubmitting, updateOffer, id, editOnLoad, handleClose } = this.props;
        const { dueDate, scheduleSelected } = this.state;

        if (isSubmitting)
            return;

        this.formRef.classList.add('was-validated');
        if (this.formRef.checkValidity()) {
            
            let params = functions.parseFormData(new FormData(this.formRef));
            
            let new_schedule_ids = [];
            if (scheduleSelected && scheduleSelected.length > 0) {
                for (let i = 0; i < scheduleSelected.length; i++) {
                    new_schedule_ids.push(scheduleSelected[i].id);
                }
            }

            params.schedule_ids = new_schedule_ids;
            params.due_date = dueDate;

            updateOffer(id, params).then(() => {
                toast.success("Offer updated successfully");
                this.getOfferDetail();
                if (editOnLoad) {
                    handleClose();
                } else {
                    this.setState({
                        editOffer: false
                    })
                }
            }).catch((error) => {
                console.log(error);
                toast.error(messages.INTERNAL_SERVER_ERROR);
                
            });
        }
    };

    handleScheduleClick = (id) => {
        let { scheduleSelected, jobSchedules } = this.state;

        let itemExists = null;
        let scheduleFromId = jobSchedules.find((scheduleItem) => scheduleItem.id === id);
        let newScheduleSelected = [];

        if (scheduleSelected && scheduleSelected.length > 0) {
            itemExists = scheduleSelected.find((scheduleItem) => scheduleItem.id === id);
        }
        
        if (itemExists) {
            newScheduleSelected = scheduleSelected.filter((scheduleItem) => scheduleItem.id !== itemExists.id);
        } else {
            newScheduleSelected = [...scheduleSelected, scheduleFromId];
        }

        this.setState({
            scheduleSelected: newScheduleSelected
        });
    };

    handleDueDateChange = (selectedDate) => {
        this.setState({
            dueDate: selectedDate
        })
    };

    handleClick = (ev) => {
        ev.preventDefault();
        const { id, createContract, declineOffer, onSubmit, history: {push} } = this.props;

        if(ev.target.id === 'decline_offer') {
            declineOffer(id)
            .then(() => {
                this.getOfferDetail();
                onSubmit();
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            })
        }else if(ev.target.id === 'accept_offer') {
            const { offer } = this.state;
            
            if(offer.status === 1) {//need to accept

                if (offer.job.is_urgent && !this.paymentMethod) {
                    toast.error(messages.SOS_NO_PAYMENT_METHOD);
                    return;
                }

                createContract({offer_id: id, payment_method_id: this.paymentMethod?this.paymentMethod.id:null})
                .then(() => {
                    this.getOfferDetail();
                    onSubmit();
                }).catch(({response:{data}}) => {
                    if(data.errorCode === 56){
                        toast.error(messages.PAYOUT_JOBBER_FAILED);
                    }else if(data.errorCode == 53) {
                        toast.error(messages.NO_PAYMENT_METHOD);
                        push(paths.client.APP_PAYMENT_METHOD);
                    }else if(data.errorCode === 54) {
                        toast.error(messages.INSUFFICENT_PAYMENT);
                        push(paths.client.APP_PAYMENT_METHOD);
                    }else if(data.errorCode === 57) {
                        toast.error(messages.SOS_JOBBER_NO_PAYMENT_METHOD);
                    }else
                        toast.error(messages.INTERNAL_SERVER_ERROR);
    
                    onSubmit();
                });
            }else if(offer.status === 2) {
                push(paths.client.APP_CONTRACTS + "?jobId=" + offer.job.id);
            }
        } 
    }

    createChat = (params) => {
        const {createChat, history: {push}, getIsArchivedRoom} = this.props;
        createChat(params)
        .then(({result: {data}}) => {
            const {room} = data;
            getIsArchivedRoom({roomId: room.id})
            .then(({result: {data}}) => {
                const { isArchived } = data;
                const archivedQuery = isArchived?'&archive=true':'';
                push(`${paths.client.APP_MESSAGES}?roomId=${room.id + archivedQuery}`);
            }).catch((error) => {
                console.log(error)
                toast.error(messages.CHAT_ROOM_FAILED);
            })
        }).catch((error) => {
            console.log(error)
            toast.error(messages.CHAT_ROOM_FAILED);
        })
    }

    gotoChatRoom(jobId, userId) {
        const { getChatRoomByJobber, history: {push}, getIsArchivedRoom } = this.props;

        getChatRoomByJobber({jobId, userId})
        .then(({result: {data}}) => {
            const {room} = data;
            if(room)
                getIsArchivedRoom({roomId: room.id})
                .then(({result: {data}}) => {
                    const { isArchived } = data;
                    const archivedQuery = isArchived?'&archive=true':'';
                    push(`${paths.client.APP_MESSAGES}?roomId=${room.id + archivedQuery}`);
                }).catch((error) => {
                    console.log(error)
                    toast.error(messages.CHAT_ROOM_FAILED);
                })
            else {
                const user_ids = [this.authUser.id, userId];
                this.createChat({user_ids, title:null, job_id: jobId, type: "job"});
            }
        }).catch((error) => {
            console.log(error)
            toast.error(messages.CHAT_ROOM_FAILED);
        })
    }

    render() {
        const { isOpen, handleClose, history, editOnLoad } = this.props;
        const { offer, isLoading, editOffer, dueDate, jobSchedules, scheduleSelected } = this.state;

        let content = null
        if (isLoading || !offer) {
            content = <Loader />;
        }else{
            content = (
                <div className="detail-container mt-3">
                    <section>
                        <div className="flex-wrapper">
                            <div className="left-wrapper">
                                <h5>{offer.job.title}</h5>
                            </div>

                            <div className="right-wrapper">
                                {!offer.job.is_public && (
                                    <span className="badge badge-dark">Private</span>
                                )}
                                {offer.job.is_urgent && (
                                    <span className="badge badge-danger">SOS</span>
                                )}
                               
                            </div>
                        </div>
                        <div className="jobber-row">
                            <div className={"avatar" + (!offer.jobber.avatar?" no-border":"")}>
                                <img src={offer.jobber.avatar?offer.jobber.avatar:'/static/images/avatar.png'} alt="" />
                            </div>
                            <div className="left-wrapper">
                                <div className="name">{offer.jobber.first_name} {offer.jobber.last_name}</div>
                                {offer.jobber.company && (
                                    <div className="company">{offer.jobber.company}</div>
                                )}
                                <Score score={offer.jobber.score} />
                            </div>
                            <div className="right-wrapper">
                                <div className="action">
                                    <img src="/static/images/icons/icon-chat-gray.svg" alt="" onClick={() => this.gotoChatRoom(offer.job.id, offer.jobber.id)}/>
                                </div>
                                <Link to={"/app/jobber/profile/" + offer.jobber.id} className="link-green mt-auto">View Profile</Link>
                            </div>
                        </div>
                    </section>

                    {offer.status === 1 && !this.isJobOwner && !editOnLoad?   
                    <section>          
                        <div className="jobber-row">
                            <div style={{display: "flex", justifyContent: "flex-end", width: "100%"}}>
                                <button id="edit_offer" style={{display: "flex", alignItems: "center", padding: "0", border: "0", background: "none", outline: "none"}} onClick={this.handleEditOfferClick}>
                                    <span style={{color: "#10547F", fontSize: "14px", fontWeight: "500", marginRight: "5px"}}>Edit Offer</span><img style={{height: "25px", width: "25px"}} src="/static/images/icons/icon-edit-gray.svg" alt=""></img>
                                </button>
                            </div>
                        </div> 
                    </section>: null}
                    <form ref={ref => this.formRef = ref} className="offer-form" noValidate>
                    <section>
                    
                        <div className="row">
                            <div className="col-md-6 mb-md-0 mb-3">
                                <h5>Offer</h5>
                                <div className="row">
                                    <div className="col-6 col-md-12 mb-md-3">
                                        <div className="due-date" hidden>
                                            <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                            {editOffer || editOnLoad? 
                                            <DatePicker
                                                name='due_date'
                                                dateFormat="dd/MM/yyyy"
                                                className="form-control dark-input sm-input"
                                                selected={moment(dueDate).toDate()}
                                                onChange={this.handleDueDateChange}
                                                required
                                                autoComplete='off'
                                            /> :
                                            <span>{offer.due_date ? moment(offer.due_date).format("DD/MM/YY") : '-'}</span>}
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-12">
                                        <div className="offer-price">
                                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                            {editOffer || editOnLoad?
                                            <input type="text" name="price" className="form-control dark-input sm-input" defaultValue={offer.price} required/> :
                                            <span>{offer.price ? `$${offer.price}` : `-`}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <h5>Cover Letter</h5>
                                {editOffer || editOnLoad?
                                <textarea name="cover_letter" defaultValue={offer.cover_letter} className="form-control dark-input auto-expand" data-min-rows="3" data-max-rows="3" rows="3"/> :
                                <div className="cover-letter">
                                    {offer.cover_letter}
                                </div>}
                            </div>
                        </div>
                    </section>

                    {offer.schedules.length > 0 && (
                        <section>
                            <h5>Schedules</h5>

                            <div className="schedule-list">
                                <div className="row">
                                    {(!editOffer && !editOnLoad) && offer.schedules.map(item => {
                                        return (
                                            <div className="col-md-12">
                                                <ScheduleItem
                                                    history={history}
                                                    jobId={offer.job_id}
                                                    data={item}
                                                />
                                            </div>
                                        );
                                    })}
                                    {(editOffer || editOnLoad) && jobSchedules.map(item => {
                                        let itemSelected = null;
                                        if (scheduleSelected && scheduleSelected.length > 0 ) {
                                            itemSelected = scheduleSelected.find((scheduleItem) => scheduleItem.id === item.id);
                                        }
                                        return (
                                            <div className="col-md-12">
                                                <ScheduleItem
                                                    history={history}
                                                    jobId={offer.job_id}
                                                    type={2}
                                                    data={item}
                                                    selected={itemSelected? true : false}
                                                    onClick={this.handleScheduleClick}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}
                    {offer.status === 1 || offer.status === 2?
                    <div className="footer">
                        {(editOffer || editOnLoad) && <button className="btn btn-outline-success" onClick={this.handleDeleteOffer}>{"Cancel Offer"}</button>}
                        {(editOffer || editOnLoad) && <button className="btn btn-success" onClick={this.handleUpdateOffer}>{"Update Offer"}</button>}
                        {offer.status === 1 && this.isJobOwner?<button className="btn btn-outline-success" id="decline_offer" onClick={this.handleClick}>{"Decline Offer"}</button>:null}
                        {offer.status === 1 && this.isJobOwner?<button className="btn btn-success" id="accept_offer" onClick={this.handleClick}>{"Accept Offer"}</button>:null}
                        {offer.status !== 1?<button className="btn btn-success" id="accept_offer" onClick={this.handleClick}>{"View Contract"}</button>:null}
                    </div>:null}
                    </form>
                </div>
            );
        }

        return (
            <Modal isOpen={isOpen} className="offer-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleClose}/>
                </div>

                <ModalBody>
                    {editOnLoad? <h5 className="modal-title text-center">Edit Your Offer</h5> :
                    <h5 className="modal-title text-center">Offer Detail</h5>
                    }
                    {content}
                </ModalBody>
            </Modal>
        );
    }
}

OfferDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
    handleClose: PropTypes.func.isRequired,
    getOfferById: PropTypes.func.isRequired,
    createChat: PropTypes.func.isRequired,
    getChatRoomByJobber: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func,
    createContract: PropTypes.func.isRequired,
    declineOffer: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
    parentJob: PropTypes.object,
    updateOffer: PropTypes.func.isRequired,
    deleteOffer: PropTypes.func.isRequired,
    onSubmit: PropTypes.func
};

export default connect(
    null,
    { 
        ...actions.offers,
        ...actions.chats,
        ...actions.contracts
    }
)(OfferDialog);