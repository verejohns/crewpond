import React, { Component } from "react";
import { Badge } from 'reactstrap';
import connect from "react-redux/es/connect/connect";
import { toast } from 'react-toastify';
import PropTypes from "prop-types";
import actions from "../../actions";
import { paths, constant, messages } from '../../../../../utils';
import { ConfirmDialog } from "../";
import { Score } from "../../../components";

class UserCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isConfirmModal: false
        }
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    gotoProfile = (id) => {
        const {history: {push}} = this.props;
        push(paths.build(paths.client.APP_JOBBER_PROFILE, id))
    }

    gotoChat = (id) => {
        const { createChat, history: {push}, jobId, data, getIsArchivedRoom } = this.props;

        const user_ids = [this.authUser.id, id];
        createChat({user_ids, title:null, job_id: jobId, type: "job"})
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

    deleteSubUser = () => {
        const {deleteSubUser, onDeleted, data} = this.props;
        deleteSubUser(data.id)
        .then(() => {
            onDeleted();
        }).catch(() => {
            console.log(error)
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    switchAccount = (ev) => {
        ev.preventDefault();
        const { switchAccount, data } = this.props;
        switchAccount({switch_id: data.id})
        .then(({result}) => {
            localStorage.setItem(constant.SUB_USERS, data.id)
            location.href = paths.client.APP_BASE;
        }).catch(({response: {data}}) => {
            if(data.errorCode === 323) {
                return toast.error(messages.NO_MEMBER_OF_COMPANY);
            }
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    render() {
        const { data } = this.props;
        const { isConfirmModal } = this.state;
        const completionRate = data.review.number_of_feedback && data.review.number_of_feedback > 0?((data.review.number_of_success/data.review.number_of_feedback)*100):0;
        return (
            <div className="card jobber-card">
                <div className="card-body">
                    <ConfirmDialog isOpen={isConfirmModal} description={messages.REMOVE_SUB_USER} ok="Yes" cancel="No" onOk={this.deleteSubUser} onCancel={() => this.setState({isConfirmModal: false})}/>
                    <div className="card-body-inner">
                        <div className="left-wrapper">
                            <div className={`avatar${data.status? ' invited' : ''}${!data.status && !data.avatar? ' no-border' : ''}`}>
                                {data.status?
                                    <img src="/static/images/icons/icon-check-green.svg" alt="" />
                                    : <img src={data.avatar?data.avatar:"/static/images/avatar.png"} alt="" />
                                }
                            </div>
                        </div>
                        <div className="right-wrapper">
                            <div className="detail">
                                <h5 className="name">{data.first_name + " " + data.last_name}</h5>
                                <Score score={data.review.score} />
                                <div className="success-rate">
                                    {completionRate === 0?"No Completion Rate":((completionRate % 1 === 0?completionRate:completionRate.toFixed(2)) + "%  Success rate")}
                                </div>
                            </div>
                            <div className="action">
                                <div className="top">
                                    <span>
                                        <img src="/static/images/icons/icon-comment.svg" alt="" onClick={() => this.gotoChat(data.id)} />
                                    </span>
                                    <span>
                                        <img src="/static/images/icons/icon-briefcase.svg" alt="" onClick={() => this.gotoProfile(data.id)} />
                                    </span>
                                    {/* <span>
                                        <img src="/static/images/icons/icon-bolt.svg" alt="" />
                                    </span> */}
                                    <span>
                                        <img src={data.is_favorite?"/static/images/icons/icon-star-green.svg":"/static/images/icons/icon-star.svg"} alt="" />
                                    </span>
                                    {this.authUser.sub_accounts === 0?<span>
                                        <img src="/static/images/icons/icon-delete-gray.svg" alt="" onClick={() => this.setState({isConfirmModal: true})}/>
                                    </span>:null}
                                </div>
                                <div className="medium">
                                    {data.is_key_jobber?<Badge color="dark">Featured</Badge>:null}
                                </div>
                                {this.authUser.sub_accounts === 1?<div className="bottom">
                                    <span onClick={this.switchAccount}>View as member</span>
                                </div>:null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

UserCard.propTypes = {
    data: PropTypes.object.isRequired,
    createChat: PropTypes.func.isRequired,
    deleteSubUser: PropTypes.func.isRequired,
    switchAccount: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func.isRequired,
    onDeleted: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    null,
    { 
        ...actions.authentication,
        ...actions.chats,
        ...actions.users
    }
)(UserCard);
