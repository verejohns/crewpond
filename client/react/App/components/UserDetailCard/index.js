import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from 'moment';
import actions from '../../actions';
import connect from 'react-redux/es/connect/connect';
import toast from 'react-toastify';
import { paths, constant, messages } from '../../../../../utils';
import { withRouter } from 'react-router-dom';

import PerfectScrollbar from 'react-perfect-scrollbar';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Modal, ModalBody} from 'reactstrap';
import { Score, Loader } from '../../../components';
import { ConfirmDialog, ParticipantCard } from '../';

class UserDetailCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            isEditable: false,
            data: null,
            isOpen: false,
            description: '',
            isLeave: true,
            deleteUserId: null,
            isAddModal: false,
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT)),
            jobbers: [],
            favoriteJobbers: [],
            isArchived: false
        };

        this.limit = 10;
        this.lastValue = null;
        this.lastUsersValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;
    }

    componentWillMount() {
        const { data } = this.props;
        this.setState({
            data,
            isArchived: false
        });
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.data !== nextProps.data) {
            this.setState({
                data: nextProps.data,
                isArchived: false,
            });
        }
    }

    handleInputChange = (ev) => {
        let {data} = this.state;
        data[ev.target.id] = ev.target.value;
        this.setState({data});
    }

    gotoProfile = (id) => {
        const {history: {push}} = this.props;
        this.setState({isAddModal: false});
        push(paths.build(paths.client.APP_JOBBER_PROFILE, id));
    }

    updateChat = () => {
        const { updateChat } = this.props;
        const {data} = this.state;
        updateChat(data.id, {title: data.title})
        .then(() => {
            this.setState({isEditable: false});
            toast.success("Chat room title updated successfully");
        }).catch(() => {
            toast.error("Chat room title update was failed");
        })
    }

    handleEdit = (isOwner) => {
        if(isOwner) {
            if(this.state.isEditable)
                this.updateChat();
            else {
                this.setState({isEditable: true});
            }
        }else if(!isOwner) {
            this.setState({
                isOpen: true,
                isLeave: true,
                title: 'Leave Chat',
                description: messages.LEAVE_CHAT_CONFIRM
            });
        }
    }

    handleOK =() => {
        const { leaveChatRoom, deleteUserFromRoom } = this.props;
        let { data, deleteUserId, isLeave, authUser } = this.state;
        if(isLeave){
            leaveChatRoom({room_id: data.id})
            .then(() => {
                data.users = data.users.filter(el=>el.id !== authUser.id);
                this.setState({data, isOpen: false});
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            })
        }else {
            deleteUserFromRoom({room_id: data.id, user_id: deleteUserId})
            .then(() => {
                data.users = data.users.filter(el=>el.id !== deleteUserId);
                this.setState({data, isOpen: false});
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            })
        }
    }

    removeUserFromRoom = (ev, id) => {
        ev.stopPropagation();
        this.setState({
            isLeave: false,
            isOpen: true,
            title: 'Confrim',
            description: messages.REMOVE_USER_CHAT_CONFIRM,
            deleteUserId: id
        })
    }

    selectUser = (item, type) => {
        let { jobbers, favoriteJobbers } = this.state;
        if(type === 0) {//jobbers in offers
            const jobberId = jobbers.findIndex(el=>el.id === item.id);
            if(jobberId > -1) {
                jobbers[jobberId].status = jobbers[jobberId].status?false:true
            }
            this.setState({jobbers});
        }else if(type === 1) {//favorite jobbers
            const jobberId = favoriteJobbers.findIndex(el=>el.id === item.id);
            if(jobberId > -1) {
                favoriteJobbers[jobberId].status = favoriteJobbers[jobberId].status?false:true
            }
            this.setState({favoriteJobbers});
        }
    }

    handleAdduser = () => {
        const { jobbers, favoriteJobbers, data } = this.state;
        const { addUserToRoom, onSubmitAdd } = this.props;
        let user_ids = [];

        for(let i = 0; i < jobbers.length; i += 1) {
            if(jobbers[i].status)
                user_ids.push(jobbers[i].id);
        }

        for(let j = 0; j < favoriteJobbers.length; j += 1) {
            if(favoriteJobbers[j].status)
                user_ids.push(favoriteJobbers[j].id);
        }

        addUserToRoom({room_id: data.id, user_ids})
        .then(() => {
            this.setState({isAddModal: false});
            onSubmitAdd(data);
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    renderAddModal() {
        const { isAddModal, jobbers, favoriteJobbers } = this.state;
        const { history } = this.props;
        return (
            <Modal isOpen={isAddModal} className="add-user-dialog" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isAddModal: false})}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Select Participants</h5>
                    <Tabs>
                        <TabList>
                            <Tab className="jobber-tab" selectedClassName="selected-contract-tab">Jobbers</Tab>
                            <Tab className="jobber-tab" selectedClassName="selected-contract-tab">Favorite Jobbers</Tab>
                        </TabList>
                        <TabPanel>
                            <PerfectScrollbar
                                onYReachEnd={this.loadMoreUsers}
                                options={{
                                    suppressScrollX: true
                                }}
                            >
                                {jobbers.map((item, key) => {
                                    return <ParticipantCard history={history} data={item} key={key} onGotoChat={() => this.setState({isAddModal: false})} selectUser={() => this.selectUser(item, 0)}></ParticipantCard>
                                })}
                            </PerfectScrollbar>
                        </TabPanel>
                        <TabPanel>
                            <PerfectScrollbar
                                onYReachEnd={this.loadMoreFavorite}
                                options={{
                                    suppressScrollX: true
                                }}
                            >
                                {favoriteJobbers.map((item, key) => {
                                    return <ParticipantCard data={item} history={history} key={key} onGotoChat={() => this.setState({isAddModal: false})} selectUser={() => this.selectUser(item, 1)}></ParticipantCard>
                                })}
                            </PerfectScrollbar>
                        </TabPanel>
                    </Tabs>
                    <div className="footer">
                        <button className="btn btn-outline-success" onClick={() => this.setState({isAddModal: false})}>Cancel</button>
                        <button className="btn btn-success" onClick={this.handleAdduser}>Add</button>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    handleParticipantModal = () => {
        const {getOffers, data} = this.props;
        if(data.chatType === 'job') {
            getOffers({
                job_id: data.job.id,
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
        }else if(data.chatType === 'group') {
            this.loadUsers();
        }

        this.loadFavoriteJobbers();
        this.setState({
            isAddModal: true
        });
    }

    loadUsers = () => {
        const { getUsers } = this.props;
        getUsers({
            orderBy: 'id',
            limit: 10,
            lastValue: this.lastUsersValue
        }).then(({ result: { data } }) => {
            const { users, lastValue } = data;
            const jobbers = this.state.jobbers.concat(users);
            this.lastUsersValue = lastValue;
            this.setState({jobbers});
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    loadMoreUsers = () => {
        const { data } = this.props;
        if(this.lastUsersValue && data.chatType === 'group'){
            this.loadUsers();
        }
    }

    loadFavoriteJobbers = () => {
        const {getFavoriteUsers} = this.props;

        getFavoriteUsers({
            limit: this.limit,
            orderBy: this.orderBy
        }).then(({ result }) => {
            let { favoriteJobbers } = this.state;
            favoriteJobbers = favoriteJobbers.concat(result.data.users);

            this.lastValue = result.data.users.lastValue;
            this.setState({ favoriteJobbers });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    loadMoreFavorite = () => {
        if(this.lastValue){
            this.loadFavoriteJobbers();
        }
    };

    handleArchive = (ev) => {
        ev.preventDefault();
        const { room, archiveChat, onSubmitArchive } = this.props;
        const { data, isArchived } = this.state;
        
        if(isArchived)
            return;
        archiveChat(room.id)
        .then(() => {
            this.setState({isArchived: true});
            onSubmitArchive(room.id);
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    renderGroupDetail() {
        const { data, isEditable, isOpen, title, description, authUser, isArchived } = this.state;
        let isOwner = false;
        if(data.chatType === 'job') {
            if(data.job.owner_id === authUser.id)
                isOwner = true;
        }else if(data.chatType === 'group'){
            isOwner = true;
        }

        if(!data) {
            return <Loader></Loader>
        }

        return (
            <div className="card user-detail-card">
                {this.renderAddModal()}
                {isOpen?<ConfirmDialog isOpen={isOpen} title={title} description={description} ok="Yes" cancel="No" onOk={this.handleOK} onCancel={() => this.setState({isOpen: false})}></ConfirmDialog>:null}
                <div className="card-body">
                    <div className="header">
                        <div className="center-wrapper">
                            <div className="avatar">
                                <img src={data.avatar?data.avatar:"/static/images/group_avatar.png"} ></img>
                            </div>
                            <div className="user-name">
                                {isEditable === false?<span><h5>{data.title}</h5></span>:
                                <input className="form-control" id="title" onChange={this.handleInputChange} value={data.title}></input>}
                                <span className="chat-member-status">{data.job?"Job Title: " + data.job.title:data.users.length + " Members in chat"}</span>
                            </div>
                            <div className="action" onClick={() => this.handleEdit(isOwner)}>
                                <img src={isOwner?(isEditable?"/static/images/icons/icon-edit-green.svg":"/static/images/icons/icon-edit-gray.svg"):"/static/images/ic_leave_chat.png"}></img>
                            </div>
                        </div>
                    </div>
                    <div className="group-members">
                        <div className="user-detail-title">
                            {"Members"}
                            {isOwner?<div className="action" onClick={this.handleParticipantModal}>
                                <img src={"/static/images/icons/icon-add.svg"}></img>
                            </div>:null}
                        </div>
                        <div className="group-member-avatars">
                            {
                                data.users.map((item, key) => {
                                    return (
                                        <div className="member-avatar" key={key} onClick={() => this.gotoProfile(item.id)}>
                                            {isOwner&&data.chatType==='job'&&authUser.id!==item.id?<span className="fa fa-minus-circle" onClick={(ev) => this.removeUserFromRoom(ev, item.id)}></span>:null}
                                            <img src={item.avatar?item.avatar:'/static/images/avatar.png'}></img>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="group-created-date">
                        <div className="user-detail-title">{"Created Date"}</div>
                        {moment(data.createdAt).format('MM/DD/YYYY')}
                    </div>
                    <div className="archive-container">
                        <span className={`archive-action${isArchived?' archived':''}`} onClick={this.handleArchive}>{isArchived?'Archived':'Archive Chat'}</span>
                    </div>
                </div>
            </div>
        )
    }

    renderUserDetail() {
        const { data: {id, avatar,first_name, last_name, experience_years, experience_months, availability, location,
            score,number_of_completed,number_of_feedback,number_of_success,
            description,skills}, isArchived } = this.props;
        let skillBody = null
        if(skills){
            skillBody = skills.map((item, key)=>{
                return (
                    <div className="category-item" key={key}>{item}</div>
                )
            })
        }
        return (
            <div className="card user-detail-card">
                <div className="card-body">
                    <div className="header">
                        <div className="center-wrapper">
                            <div className={"avatar" + (!avatar?" no-border":"")} onClick={() => this.gotoProfile(id)}>
                                <img src={avatar?avatar:'/static/images/avatar.png'} alt="" />
                            </div>
                            <div className="user-name">
                                <span><h5>{first_name + " " + last_name}</h5></span>
                                <span className="chat-member-status"><h5>{}</h5></span>
                            </div>
                        </div>
                    </div>
                    <div className="divder-line"></div>
                    <div className="user-info">
                        <div className="row">
                            <div className="col-6">{"Lives in"}</div>
                            <div className="col-6">{location?location.address:null}</div>
                        </div>
                        <div className="row">
                            <div className="col-6">{"Experience"}</div>
                            <div className="col-6">{experience_years?experience_years:0}{" years,"}{experience_months?experience_months:0}{" months"}</div>
                        </div>
                        <div className="row">
                            <div className="col-6">{"Status"}</div>
                            <div className="col-6">{availability?"Available":"Unavailable"}</div>
                        </div>
                    </div>
                    <div className="divder-line"></div>
                    <div className="user-detail-title"></div>
                    <div className="user-job-rate">
                        <div className="rate-detail rate-completed">
                            <div className="rate-value">
                                {number_of_completed?number_of_completed:0}
                            </div>
                            <div className="rate-description">
                                {"Jobs Completed"}
                            </div>
                        </div>
                        <div className="rate-detail rate-success">
                            <div className="rate-value">
                                {number_of_feedback && number_of_feedback > 0?((number_of_success?number_of_success:0/number_of_feedback)*100) + "%":0}
                            </div>
                            <div className="rate-description">
                                {"Success rate"}
                            </div>
                        </div>
                    </div>
                    <div className="user-skills">
                        <div className="user-detail-title">{"Skills"}</div>
                        {skillBody}
                    </div>
                    <div className="user-description">
                        <div className="user-detail-title">{"Description"}</div>
                        {description}
                    </div>
                    <div className="user-reviews">
                        <div className="user-detail-title">{"Review"}</div>
                        {score ? <Score score={score} /> : "No Review"}
                    </div>
                    <div className="archive-container">
                        <span className={`archive-action${isArchived?' archived':''}`} onClick={isArchived? null : this.handleArchive}>{isArchived?'Archived':'Archive Chat'}</span>
                    </div>
                </div>
            </div>
        )
    }

    renderAdminDetail(){
        const { data, isEdit } =  this.props;
        return (
            <div className="card user-detail-card">
                <div className="card-body">
                    <div className="header">
                        <div className="center-wrapper">
                            <div className="image">
                                {data.avatar}
                            </div>
                            <div className="user-name">
                                <span><h5>{data.title}</h5></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const { type, data } = this.props;
        if(data && (data.chatType === 'job' || data.chatType === 'group')){
            return this.renderGroupDetail();
        }else if(data && data.chatType === 'direct')
            return this.renderUserDetail();
        else if(data && data.chatType === 'admin')
            return this.renderAdminDetail();
        else
            return null;
    }
}

UserDetailCard.defaultProps = {
    isEdit: false
}

UserDetailCard.propTypes = {
    data: PropTypes.object,
    isEdit: PropTypes.bool,
    updateChat: PropTypes.func,
    leaveChatRoom: PropTypes.func,
    addUserToRoom: PropTypes.func,
    deleteUserFromRoom: PropTypes.func,
    onSubmitAdd: PropTypes.func,
    onSubmitArchive: PropTypes.func,
    getOffers: PropTypes.func,
    getUsers: PropTypes.func,
    getFavoriteUsers: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    null,
    {
      ...actions.chats,
      ...actions.offers,
      ...actions.users
    },
  )(withRouter(UserDetailCard));
