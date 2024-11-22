import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import moment from "moment";
import selectors from "./selectors";
import actions from "../../actions";
import { constant, messages, paths } from "../../../../../utils";

import { OfferDialog, ScheduleItem, InviteCollapse } from "../";
import { Loader, Score } from "../../../components";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

class OfferDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            invites: [],
            offer: null,
            isLoading: true,
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT)),
            isOfferDialog: false,
            selectedOffer: null
        }
    }

    componentDidMount() {
        const { id } = this.props;
        this.loadOffer(id);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { id } = this.props;

        if (nextProps.id !== id) {
            this.loadOffer(nextProps.id);
        }
    }

    loadOffer = (id) => {
        const { getBadgeCount, getOfferById } = this.props;
        this.setState({isLoading: true});
        getOfferById(id)
        .then(({result: {data}}) => {
            console.log(data);
            this.loadJobById(data.offer.job_id);
            this.setState({
                offer: data.offer,
                isLoading: false,
            });
            this.getSentInvitesForJob(data.offer.job_id);
            getBadgeCount();
        }).catch((error) => {
            console.log(error);
            this.setState({isLoading: false});
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

    selectOffer = (id) => {
        this.setState({
            isOfferDialog: true,
            selectedOffer: id
        })
    }

    handleOfferClose = (id) => {
        this.setState({
            isOfferDialog: false,
            selectedOffer: null
        })
        this.loadOffer(id);
    }

    getSentInvitesForJob = (id) => {
        const { getSentInvites } = this.props;
        getSentInvites(id)
        .then(({result: {data}}) => {
            this.setState({invites: data.invites});
        })
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
        const { authUser } = this.state;
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
                const user_ids = [authUser.id, userId];
                this.createChat({user_ids, title:null, job_id: jobId, type: "job"});
            }
        }).catch((error) => {
            console.log(error)
            toast.error(messages.CHAT_ROOM_FAILED);
        })
    }

    handleDialogClose = () => {
        this.setState({
            isOfferDialog: false
        });
        const { id } = this.props;
        this.loadOffer(id);
    }

    handleArchive = (ev) => {
        ev.preventDefault();
        const { archiveOffer, id } = this.props;
        archiveOffer(id)
        .then(() => {
            location.href = paths.client.APP_OFFERS
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    render() {
        const { invites, isLoading, offer, authUser, isOfferDialog, selectedOffer, job } = this.state;
        const { history } = this.props;
        if (isLoading || !offer) {
            return (
                <Loader />
            );
        }

        return (
            <div className="detail-container">
                {isOfferDialog?<OfferDialog id={selectedOffer} editOnLoad={job?.owner_id === authUser.id? false : true} parentJob={job} isOpen={isOfferDialog} handleClose={() => this.handleOfferClose(offer.id)} onSubmit={this.handleDialogClose} history={history}/>:null}
                <div className="slider-header status">
                    <span className="active">Open</span>
                    <span className={offer.job.is_assigned ? "active" : null}>Assigned</span>
                    <span className={offer.job.is_completed ? "active" : null}>Completed</span>
                </div>

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
                            {authUser.id === offer.jobber.id && <div className="archive-container" onClick={this.handleArchive}>
                                <span className="archive-action">Archive Offer</span>
                            </div>}
                        </div>
                    </div>
                    {/* <div className="jobber-row">
                        <div className={"avatar" + (!offer.job.user.avatar?" no-border":"")}>
                            <img src={offer.job.user.avatar?offer.job.user.avatar:'/static/images/avatar.png'} alt="" />
                        </div>
                        <div className="left-wrapper">
                            <div className="name">{offer.job.user.first_name} {offer.job.user.last_name}</div>
                            {offer.job.user.company && (
                                <div className="company">{offer.job.user.company}</div>
                            )}
                            <Score score={offer.job.user.score} />
                        </div>
                        <div className="right-wrapper">
                            <div className="action">
                                <img src="/static/images/icons/icon-chat-gray.svg" alt="" onClick={() => this.gotoChatRoom(offer.job.id, offer.job.user.id)}/>
                            </div>
                            <Link to={"/app/jobber/profile/" + offer.job.user.id} className="link-green mt-auto">View Profile</Link>
                        </div>
                    </div> */}
                </section>

                <section>
                    <div className="row">
                        <div className="col-md-6 mb-md-0 mb-3">
                            <h5>Offer</h5>
                            <div className="row">
                                <div className="col-6 col-md-12 mb-md-3">
                                    <div className="due-date">
                                        <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                        <span>{offer.due_date ? moment(offer.due_date).format("DD/MM/YY") : '-'}</span>
                                    </div>
                                </div>
                                <div className="col-6 col-md-12">
                                    <div className="offer-price">
                                        <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                        <span>{offer.price ? `$${offer.price}` : `-`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h5>Cover Letter</h5>
                            <div className="cover-letter">
                                {offer.cover_letter}
                            </div>
                        </div>
                    </div>
                </section>

                {offer.schedules.length > 0 && (
                    <section>
                        <h5>Schedules</h5>

                        <div className="schedule-list">
                            <div className="row">
                                {offer.schedules.map(item => {
                                    return (
                                        <div className="col-md-6">
                                            <ScheduleItem
                                                history={history}
                                                jobId={offer.job_id}
                                                data={item}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {offer.job.assignees.length > 0 && (
                    <section>
                        <h5>Assigned ({offer.job.assignees.length})</h5>

                        {offer.job.assignees.map(item => {
                            const rate = 100 * parseInt(item.jobber.number_of_success) / parseInt(item.jobber.number_of_feedback);

                            return (
                                <div className="jobber-row">
                                    <div className={"avatar" + (!item.jobber.avatar?" no-border":"")}>
                                        <img src={item.jobber.avatar?item.jobber.avatar:'/static/images/avatar.png'} alt="" />
                                    </div>
                                    <div className="left-wrapper">
                                        <div className="name">{item.jobber.first_name} {item.jobber.last_name}</div>
                                        <Score score={item.jobber.score} />
                                        <div className="rate">
                                            {item.jobber.number_of_feedback === '0' ?
                                                'No ' : `${(rate % 1 === 0 ?rate:rate.toFixed(2))}% `
                                            }
                                            Completion rate
                                        </div>
                                    </div>
                                    <div className="right-wrapper">
                                        {item.jobber.company && (
                                            <div className="company">{item.jobber.company}</div>
                                        )}
                                        <div className="hired-at">{moment(item.contract.createdAt).fromNow()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}

                {offer.job.offers.length > 0 && (
                    <section>
                        <h5>Offers ({offer.job.offers.length})</h5>

                        {offer.job.offers.map(item => {
                            console.log(item);
                            const rate = 100 * parseInt(item.jobber.number_of_success) / parseInt(item.jobber.number_of_feedback);

                            return (
                                <div className={`jobber-row${job?.owner_id === authUser.id ? ' selectable' : ''}${item.jobber.id === authUser.id ? ' active' : ''}`} onClick={(item.jobber.id === authUser.id || job?.owner_id === authUser.id)? () => this.selectOffer(offer.id) : null}>
                                    <div className={"avatar" + (!item.jobber.avatar?" no-border":"")}>
                                        <img src={item.jobber.avatar?item.jobber.avatar:'/static/images/avatar.png'} alt="" />
                                    </div>
                                    <div className="left-wrapper">
                                        <div className="name">{item.jobber.first_name} {item.jobber.last_name}</div>
                                        <Score score={item.jobber.score} />
                                        <div className="rate">
                                            {item.jobber.number_of_feedback === '0' ?
                                                'No ' : `${(rate % 1 === 0 ?rate:rate.toFixed(2))}% `
                                            }
                                            Completion rate
                                        </div>
                                    </div>
                                    <div className="right-wrapper">
                                        {item.jobber.company && (
                                            <div className="company">{item.jobber.company}</div>
                                        )}
                                        {item.price && (
                                            <div className="price">
                                                <img className="mr-2" src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                                <span>{item.price ? `$${item.price}` : `-`}</span>
                                            </div>
                                        )}
                                        <div className="hired-at">{moment(item.createdAt).fromNow()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}

                {(invites.length) > 0 && (
                    <section>
                        <h5>Invites ({invites.filter(el=>el.job_id === offer.job_id).length})</h5>

                        {invites.map(item => {
                            if(item.job_id === offer.job_id)
                                return <InviteCollapse invite={item} isHirerView={item.sender_id === authUser.id}/>
                            else
                                return null;
                        })}
                    </section>
                )}

            </div>
        );
    }
}

OfferDetail.propTypes = {
    id: PropTypes.number.isRequired,
    getJobById: PropTypes.func.isRequired,
    offer: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    createChat: PropTypes.func.isRequired,
    getOfferById: PropTypes.func.isRequired,
    getChatRoomByJobber: PropTypes.func.isRequired,
    getSentInvites: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func,
    archiveOffer: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors,
    { 
        ...actions.offers,
        ...actions.chats,
        ...actions.invites,
        ...actions.jobs,
        ...actions.notifications
    }
)(OfferDetail);
