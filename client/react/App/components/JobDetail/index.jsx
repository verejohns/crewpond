import React, { Component } from "react";
import actions from "../../actions";
import connect from "react-redux/es/connect/connect";
import moment from "moment";
import PropTypes from "prop-types";
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link } from "react-router-dom";
import { messages, paths, constant } from "../../../../../utils";

import ScheduleItem from "../ScheduleItem";
import { NewChat, OfferDialog, OfferForm, ConfirmDialog, InviteCollapse } from '../';
import { Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { Loader, Score, Switch } from "../../../components";

import GoogleMapReact from 'google-map-react';
const AnyReactComponent = () => <span class="fa fa-map-marker" aria-hidden="true"></span>;

class JobDetail extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            isOpen: false,
            job_id: null,
            isModalOpened: false,
            isChatListModal: false,
            isOfferDialog: false,
            chatList: [],
            selectedOffer: null,
            isLoading: false,
            job: null,
            isConfirmModal: false,
            invites: [],
            jobbers: [],
            favoriteJobbers: [],
            isOpenMap: false,
            latitude: -33.865143,
            longitude: 151.209900,
            defaultZoom: 11
        };

        this.handleCreateRoom = this.handleCreateRoom.bind(this);
        this.gotoChatRoom = this.gotoChatRoom.bind(this);

        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
        this.limit = 10;
        this.lastValue = null;
        this.favLastValue = null;
        this.orderBy = "id";
    }

    componentDidMount() {
        const { id } = this.props;
        this.loadJobById(id);
        this.getSentInvitesForJob(id);
    }

    componentWillReceiveProps(nextProps) {
        const { id } = this.props;

        if (nextProps.id !== id) {
            this.loadJobById(nextProps.id);
        }
    }

    getSentInvitesForJob = (id) => {
        const { getSentInvites } = this.props;
        getSentInvites(id)
        .then(({result: {data}}) => {
            this.setState({invites: data.invites});
        })
    }

    loadJobById = (id) => {
        const { getJobById } = this.props;
        this.setState({
            isLoading: true
        })
        getJobById(id)
        .then(({result: {data}}) => {
            this.setState({
                job: data.job,
                isLoading: false,
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
            this.setState({
                isLoading: false
            });
        });
    }

    showChatDialog = () => {
        const { getChatRoomByJobber, getChatListByJobId } = this.props;
        const { job } = this.state;
        if(job.owner_id === this.authUser.id) {// this is hirer
            getChatListByJobId({limit: this.limit, orderBy: this.orderBy, lastValue: this.lastValue, job_id: job.id})
            .then(({result: {data}}) => {
                if(data.rooms.length > 0){//if chat room is exist for this job
                    this.setState({
                        chatList: data.rooms,
                        isChatListModal: true
                    });
                }else {// not exist chat room for this job.
                    this.showNewChatDialog();
                }
            });
        }else {// this is jobber
            getChatRoomByJobber({userId: this.authUser.id, jobId: job.id})
            .then(({result: {data}}) => {
                if(data.room){
                    this.gotoChatRoom(data.room.id);
                }else{
                    this.showNewChatDialog();
                }
            });
        }
    }

    showNewChatDialog = () => {
        console.log('show new chat dialog')
        this.loadJobbers();
        this.loadFavoriteJobbers();
        this.setState({isOpen: true, isChatListModal: false});
    }

    handleClose() {
        this.setState({
            isOpen: false
        })
    }

    validateRoom(title, user_ids) {
        if(title === '') {
            toast.error(messages.CHAT_ROOM_NAME_REQUIRED);
            return false;
        }
        if(user_ids.length === 0) {
            toast.error(messages.CHAT_USERS_REQUIRED);
            return false;
        }
        return true;
    }

    gotoChatRoom(room_id) {
        const {history: {push}, getIsArchivedRoom} = this.props;
        getIsArchivedRoom({roomId: room_id})
        .then(({result: {data}}) => {
            const { isArchived } = data;
            const archivedQuery = isArchived?'&archive=true':'';
            push(`${paths.client.APP_MESSAGES}?roomId=${room_id + archivedQuery}`);
        }).catch((error) => {
            console.log(error)
            toast.error(messages.CHAT_ROOM_FAILED);
        })
    }

    gotoProfile = () => {
        const {history: {push}} = this.props;
        const {job} = this.state;
        if(this.authUser.id === job.owner_id)
            push(paths.client.APP_PROFILE);
        else
            push(paths.build(paths.client.APP_JOBBER_PROFILE, job.owner_id));
    }

    handleCreateRoom(chat_name, jobbers, favorites, isGroupChat) {
        const {createChat, id, history: { push }, getIsArchivedRoom } = this.props;
        let selectedJobbers = [];
        if(jobbers){
            selectedJobbers = selectedJobbers.concat(jobbers.filter(function (el) {
                if(el.is_selected)
                    return true;
                else
                    return false;
            }));
        }
        if(favorites) {
            selectedJobbers = selectedJobbers.concat(favorites.filter(function (el) {
                if(el.is_selected)
                    return true;
                else
                    return false;
            }));
        }

        let user_ids = [this.authUser.id];
        for(let i = 0; i < selectedJobbers.length; i += 1){
            user_ids.push(selectedJobbers[i].id);
        }

        if(this.validateRoom(chat_name, user_ids)) {
            createChat({user_ids, title: null, job_id: id, type: isGroupChat?"group":"job"})
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
                console.error(error);
                toast.error(messages.INTERNAL_SERVER_ERROR);
            })
            this.setState({
                isOpen: false
            });
        }
    }

    onEditJob = (ev) => {
        ev.preventDefault();
        const { history: {push}, id} = this.props;
        push(paths.build(paths.client.APP_EDIT_JOB, id));
    }

    afterSendOffer = (status) => {
        const { id } = this.props;
        this.setState({isModalOpened: false});
        if(status === true)
            this.loadJobById(id);
    };

    showSendOffer = (ev) => {
        ev.preventDefault();
        this.setState({isModalOpened: true})
    }

    handleInvite = (ev) => {
        ev.preventDefault();
        const { history: { push } } = this.props;
        const { job } = this.state;
        push(`${paths.client.APP_INVITES_REQUEST}?jobId=${job.id}`);
    }

    selectOffer = (id) => {
        this.setState({
            isOfferDialog: true,
            selectedOffer: id
        })
    }

    handleOfferClose = () => {
        this.setState({
            isOfferDialog: false,
            selectedOffer: null
        })
    }

    acceptOffer = (status) => {
        const { id } = this.props;
        if(status === true) {
            this.loadJobById(id);
        }
        this.setState({
            isOfferDialog: false,
            selectedOffer: null
        })
    }

    togglePublic = (checked) => {
        let { job } = this.state;
        let params = {is_public: !checked}
        this.updateJob(job.id, params);
    }

    toggleSOSJob = (checked) => {
        if(checked) {
            this.setState({isConfirmModal: true});
        }else {
            const { job } = this.state;
            let params = {is_urgent: false}
            this.updateJob(job.id, params);
        }
    }

    handleOK = () => {
        let { job } = this.state;
        let params = {is_urgent: true}
        this.updateJob(job.id, params);
    }

    updateJob = (jobId, params) => {
        let formData = new FormData();
        for(let key in params) {
            formData.append(key, params[key]);
        }
        const { updateJob } = this.props;
        updateJob(jobId, formData)
        .then(({result: {data}}) => {
            let { job } = this.state;
            job.is_urgent = data.job.is_urgent;
            job.is_public = data.job.is_public;
            this.setState({ job, isConfirmModal: false });
            toast.success(messages.UPDATE_JOB_SUCCEED);
        }).catch(() => {
            toast.error(messages.UPDATE_JOB_FAILED);
        });
    }

    handleCancel = () => {
        this.setState({isConfirmModal: false});
    }

    loadJobbers = () => {
        const {getOffers, id} = this.props;
        getOffers({
            job_id: id,
            limit: this.limit,
            orderBy: this.orderBy,
        }).then(({ result }) => {
            let jobbers = [];
            for(let i = 0; i < result.data.offers.length; i += 1)
                jobbers.push(result.data.offers[i].jobber);
            this.setState({jobbers});
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    loadFavoriteJobbers = () => {
        const {getFavoriteUsers} = this.props;

        getFavoriteUsers({
            limit: this.limit,
            orderBy: this.orderBy,
            lastValue: this.favLastValue,
        }).then(({ result }) => {
            let { favoriteJobbers } = this.state;
            favoriteJobbers = favoriteJobbers.concat(result.data.users);

            this.favLastValue = result.data.users.lastValue;
            this.setState({ favoriteJobbers });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    loadMoreFavorite = () => {
        if(this.favLastValue){
            this.loadFavoriteJobbers();
        }
    };

    renderChatListModal(){
        let { avatar, noborder, isChatListModal, chatList, job } = this.state;

        return (
            <Modal isOpen={isChatListModal} className="new-chat-dialog" centered>
                <div className="modal-dialog-header">

                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isChatListModal: false})}/>
                </div>

                <ModalBody>
                    <div className="modal-title text-center">
                        <h5>{ job.title }</h5>
                        <div className="action" onClick={() => this.showNewChatDialog()}>
                            <img src="/static/images/icons/icon-add.svg" alt=""></img>
                        </div>
                    </div>
                    <PerfectScrollbar className="user-list">
                        {chatList.map((item) => {
                            if((item.chatType === 'job' || item.chatType === 'group')) {
                                avatar = avatar?avatar:'/static/images/group_avatar.png';
                                noborder = !avatar;
                            }
                            return (
                                <div className="jobber-row">
                                    <div className={`avatar${noborder?' no-border':''}`}>
                                        <img src={avatar} alt="" />
                                    </div>
                                    <div className="left-wrapper">
                                        <div className="name">{item.title}</div>
                                        <div className="name">
                                            {item.users.map((user) => {
                                                return (
                                                    user.first_name + " " + user.last_name + ", "
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="right-wrapper">
                                        <div className="action">
                                            <img src="/static/images/icons/icon-comment.svg" alt="" onClick={() => this.gotoChatRoom(item.id)}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </PerfectScrollbar>
                </ModalBody>
            </Modal>
        );
    };

    renderModal(){
        const { isModalOpened, job } = this.state;

        return (
            <Modal isOpen={isModalOpened} className="offer-dialog" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isModalOpened: false})}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Send Offer</h5>

                    <OfferForm
                        jobId={job.id}
                        onSubmit={this.afterSendOffer}
                    />
                </ModalBody>
            </Modal>
        );
    };

    renderMapModal() {
        const { defaultZoom, latitude, longitude, isOpenMap, job } = this.state;
        
        return (
            <Modal isOpen={isOpenMap} className="map-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isOpenMap: false})}/>
                </div>

                <ModalBody>
                    <div className="map-container-job-detail">
                        <GoogleMapReact
                            apiKey={process.env.GOOGLE_API_KEY}
                            center={[job.location ? job.location.latitude : latitude, job.location ? job.location.longitude : longitude]}
                            zoom={defaultZoom}

                        >
                            <AnyReactComponent
                                lat={job.location ? job.location.latitude : latitude}
                                lng={job.location ? job.location.longitude : longitude}
                            />
                        </GoogleMapReact>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    render() {
        const { history, id } = this.props;
        const { isOpen, isOfferDialog, isConfirmModal, selectedOffer, isLoading, job, invites } = this.state;
        if (isLoading === true || !job) {
            return (
                <Loader />
            );
        }

        const accepted_offer = job.accepted_offers.find((el) => {
            if(el.job_id === job.id && el.jobber_id === this.authUser.id) {
                return true;
            }
            return false;
        });

        const suggested_offer = job.suggested_offers.find((el) => {
            if(el.job_id === job.id && el.jobber_id === this.authUser.id) {
                return true;
            }
            return false;
        });

        const openMap = () => {
            if (this.state.job.location) this.setState({isOpenMap: true});
        };

        return (
            <div className="detail-container">
                {this.renderMapModal()}
                {this.renderChatListModal()}
                {this.renderModal()}
                {isOfferDialog?<OfferDialog id={selectedOffer} parentJob={job} isOpen={isOfferDialog} handleClose={this.handleOfferClose} onSubmit={this.acceptOffer} history={history}/>:null}
                {isOpen?<NewChat isOpen={isOpen} jobId={job.id} handleCreateRoom={this.handleCreateRoom}  history={history}
                                gotoChatRoom={this.gotoChatRoom} handleClose={() => this.handleClose()}/>:null}
                <ConfirmDialog isOpen={isConfirmModal} title={"SOS Urgent staff"} description={messages.SOS_URGENT_CONFIRM} ok="Agree" cancel="Disagree" onOk={this.handleOK} onCancel={this.handleCancel}></ConfirmDialog>
                <div className="slider-header status">
                    <span className="active">Open</span>
                    <span className={job.is_assigned ? "active" : null}>Assigned</span>
                    <span className={job.is_completed || job.is_cancelled ? "active" : null}>{job.is_cancelled ? "Cancelled" : "Completed"}</span>
                </div>

                <section>
                    <div className="jobber-row">
                        <div className={"avatar" + (job.user.avatar?"":" no-border")}>
                            <img src={(job.user.avatar?job.user.avatar:'/static/images/avatar.png')} alt="" />
                        </div>
                        <div className="left-wrapper">
                            <div className="name">{(job.user.first_name + " " + job.user.last_name)}</div>
                            <div className="company">{job.user.company}</div>
                        </div>
                        <div className="right-wrapper">
                            <div className="link-green mt-auto" onClick={this.gotoProfile}>View Profile</div>
                        </div>
                    </div>
                    <div className="flex-wrapper">
                        <div className="left-wrapper">
                            <div className="category">
                                <span>Category: </span>
                                <span>{job.category.sub}</span>
                            </div>
                            <h5>{job.title}</h5>
                        </div>

                        <div className="right-wrapper">
                            <div className="d-flex mb-3">
                                {!job.is_public && (
                                    <span className="badge badge-dark">Private</span>
                                )}
                                {job.is_urgent && (
                                    <span className="badge badge-danger">SOS</span>
                                )}
                            </div>
                            {job.isEditable?<div className="action">
                                <img src="/static/images/icons/icon-edit-gray.svg" alt="" onClick={this.onEditJob}/>
                                <img src="/static/images/icons/icon-chat-gray.svg" alt="" onClick={() => this.showChatDialog()}/>
                            </div>:(!accepted_offer && !suggested_offer?<button className="btn btn-success" onClick={this.showSendOffer}>Send Offer</button>:null)}
                            {job.isEditable?<Link to={`${paths.client.APP_CONTRACTS}?jobId=${job.id}`} className="link-green">View Contract</Link>:null}
                        </div>
                    </div>
                    <div className="description">
                        {job.description}
                    </div>
                </section>

                <section>
                    <h5>Details</h5>

                    <div className="detail-list">
                        <div className="row">
                            <div className="col-lg-3 col-6 d-flex flex-row mb-2">
                                <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                <span>{job.price ? `$${job.price}` : `-`}</span>
                            </div>
                            <div className="col-lg-6 col-6 d-flex flex-row mb-2">
                                <img src="/static/images/icons/icon-location-green.svg" alt="" />
                                <span className="link-green" onClick={openMap}>{job.location ? job.location.place_name : 'Remote'}</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-3 col-6 d-flex flex-row">
                                <img src="/static/images/icons/icon-hourglass-green.svg" alt="" />
                                <span>{job.is_hourly ? 'Hourly' : 'Fixed'}</span>
                            </div>
                            <div className="col-lg-6 col-6 d-flex flex-row">
                                <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                <span>{job.due_date ? moment(job.due_date).format('DD/MM/YYYY') : '-'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {job.schedules.length > 0 && (
                    <section>
                        <h5>Schedules</h5>

                        <div className="schedule-list">
                            <div className="row">
                                {job.schedules.map(item => {
                                    return (
                                        <div className="col-md-6">
                                            <ScheduleItem
                                                isOwner={job.isEditable}
                                                history={history}
                                                jobId={id}
                                                data={item}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                <section>
                    {job.isEditable?<div className="fixed-row">
                        <h5 className="mb-0 mr-auto">Send Invites</h5>
                        <button className="btn btn-success btn-sm" onClick={this.handleInvite}>Invite</button>
                    </div>:null}
                    <div className="fixed-row">
                        <h5 className="mb-0 mr-auto">Urgent staff is needed</h5>
                        <Switch checked={job.is_urgent} disabled onChange={this.toggleSOSJob}/>
                    </div>
                    <div className="fixed-row">
                        <h5 className="mb-0 mr-auto">Private</h5>
                        <Switch checked={!job.is_public} disabled onChange={this.togglePublic}/>
                    </div>
                </section>

                {job.accepted_offers.length > 0 && (
                    <section>
                        <h5>Assigned ({job.accepted_offers.length})</h5>

                        {job.accepted_offers.map(item => {
                            const rate = 100 * parseInt(item.jobber.review.number_of_success) / parseInt(item.jobber.review.number_of_feedback);
                            const isJobberOrHirer = item.jobber_id === this.authUser.id || item.hirer_id === this.authUser.id;
                            
                            return (
                                <div className={"jobber-row" + (isJobberOrHirer?" active":"")} onClick={isJobberOrHirer ? () => this.selectOffer(item.id) : null}>
                                    <div className={"avatar" + (!item.jobber.avatar?" no-border":"")}>
                                        <img src={item.jobber.avatar?item.jobber.avatar:'/static/images/avatar.png'} alt="" />
                                    </div>
                                    <div className="left-wrapper">
                                        <div className="name">{item.jobber.first_name} {item.jobber.last_name}</div>
                                        <Score score={item.jobber.review.score} canHover={isJobberOrHirer} />
                                        <div className="rate">
                                            {item.jobber.review.number_of_feedback === '0' ?
                                                'No ' : `${(rate % 1 === 0 ?rate:rate.toFixed(2))}% `
                                            }
                                            Completion rate
                                        </div>
                                    </div>
                                    <div className="right-wrapper">
                                        <Link to={'/app/jobber/profile/' + item.jobber_id} className="link-green mt-auto">View Profile</Link>
                                        {isJobberOrHirer ?
                                        <div className="offer-price">
                                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                            <span>{"$" + item.price}</span>
                                        </div> : null}
                                        <div className="company">{item.jobber.company}</div>
                                        <div className="hired-at">{moment(item.createdAt).fromNow()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}
                {(job.suggested_offers.length) > 0 && (
                    <section>
                        <h5>Offers ({job.suggested_offers.length})</h5>

                        {job.suggested_offers.map(item => {
                            const isJobberOrHirer = item.jobber_id === this.authUser.id || item.hirer_id === this.authUser.id;
                            const rate = 100 * parseInt(item.jobber.review.number_of_success) / parseInt(item.jobber.review.number_of_feedback);
                            return (
                                <div className={"jobber-row" + (isJobberOrHirer?" active":"")} onClick={isJobberOrHirer? () => this.selectOffer(item.id): null}>
                                    <div className={"avatar" + (!item.jobber.avatar?" no-border":"")}>
                                        <img src={item.jobber.avatar?item.jobber.avatar:'/static/images/avatar.png'} alt="" />
                                    </div>
                                    <div className="left-wrapper">
                                        <div className="name">{item.jobber.first_name} {item.jobber.last_name}</div>
                                        <Score score={item.jobber.review.score} canHover={isJobberOrHirer}/>
                                        <div className="rate">
                                            {item.jobber.review.number_of_feedback === '0' ?
                                                'No ' : `${(rate % 1 === 0 ?rate:rate.toFixed(2))}% `
                                            }
                                            Completion rate
                                        </div>
                                    </div>
                                    <div className="right-wrapper">
                                        <Link to={'/app/jobber/profile/' + item.jobber_id} className="link-green mt-auto">View Profile</Link>
                                        {isJobberOrHirer? 
                                        <div className="offer-price">
                                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                            <span>{"$" + item.price}</span>
                                        </div> : null}
                                        <div className="company">{item.jobber.company}</div>
                                        <div className="hired-at">{moment(item.createdAt).fromNow()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}

                {(invites.length) > 0 && (
                    <section>
                        <h5>Sent Invites ({invites.length})</h5>

                        {invites.map(item => {
                            return (
                                <InviteCollapse invite={item} isHirerView={item.sender_id === this.authUser.id}/>
                            );
                        })}
                    </section>
                )}

            </div>
        );
    }
}

JobDetail.propTypes = {
    id: PropTypes.number.isRequired,
    getJobById: PropTypes.func.isRequired,
    getSentInvites: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func,
    createChat: PropTypes.func,
    getChatRoomByJobber: PropTypes.func,
    getChatListByJobId: PropTypes.func,
    getFavoriteUsers: PropTypes.func,
    getOffers: PropTypes.func,
    updateJob: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    null,
    {
        ...actions.jobs,
        ...actions.chats,
        ...actions.invites,
        ...actions.offers,
        ...actions.users
    }
)(JobDetail);
