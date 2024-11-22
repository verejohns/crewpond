import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import actions from "../../actions";
import {paths, constant, messages} from '../../../../../utils';

import { Badge } from 'reactstrap';

class ParticipantCard extends Component {
    constructor(props) {
        super(props);
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    gotoProfile = (id) => {
        const {history: {push}} = this.props;
        push(paths.build(paths.client.APP_JOBBER_PROFILE, id))
    }

    gotoChat = (id) => {
        const { createChat, history: {push}, data, getIsArchivedRoom, onGotoChat } = this.props;
        const user_ids = [this.authUser.id, id];
        createChat({user_ids, title: null, job_id: null, type: "direct"})
        .then(({result: {data}}) => {
            const {room} = data;
            onGotoChat();
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

    render() {
        const { data, selectUser } = this.props;
        const completionRate = data.review.number_of_feedback && data.review.number_of_feedback > 0?((data.review.number_of_success/data.review.number_of_feedback)*100):0;
        return (
            <div className="card jobber-card mt-3 mr-2">
                <div className="card-body">
                    <div className="card-body-inner">
                        <div className="left-wrapper">
                            <div className={`avatar${data.status? ' invited' : ''}${!data.status && !data.avatar? ' no-border' : ''}`} onClick={selectUser}>
                                {data.status?
                                    <img src="/static/images/icons/icon-check-green.svg" alt="" />
                                    : <img src={data.avatar?data.avatar:"/static/images/avatar.png"} alt="" />
                                }
                            </div>
                        </div>
                        <div className="right-wrapper">
                            <div className="detail">
                                <h5 className="name">{data.first_name + " " + data.last_name}</h5>
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
                                    <span>
                                        <img src={data.is_favorite?"/static/images/icons/icon-star-green.svg":"/static/images/icons/icon-star.svg"} alt="" />
                                    </span>
                                </div>
                                <div className="medium">
                                    {data.is_key_jobber?<Badge color="dark">Featured</Badge>:null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ParticipantCard.propTypes = {
    data: PropTypes.object.isRequired,
    createChat: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func,
    onGotoChat: PropTypes.func,
    selectUser: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    null,
    { 
        ...actions.chats
    }
)(ParticipantCard);
