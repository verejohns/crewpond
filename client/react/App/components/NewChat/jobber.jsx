import React, { Component } from "react";
import connect from "react-redux/es/connect/connect";
import selectors from "./selectors";
import actions from "../../actions";
import PropTypes from "prop-types";
import { paths, messages } from "../../../../../utils";

import { Score } from '../../../components';
import {toast} from "react-toastify";

class Jobber extends Component {
    gotoChatRoom() {
        const { jobId, getChatRoomByJobber, jobber, gotoChatRoom } = this.props;
        getChatRoomByJobber({jobId, userId: jobber.id})
        .then(({result: {data}}) => {
            const {room} = data;
            gotoChatRoom(room);
        }).catch((error) => {
            console.log(error)
            toast.error(messages.CHAT_ROOM_FAILED);
        })
    }

    gotoProfile = () => {
        const {history: {push}, jobber} = this.props;
        push(paths.build(paths.client.APP_JOBBER_PROFILE, jobber.id))
    }

    handleFavorite = () => {
        const {jobber} = this.props;
        
    }

    render() {
        const { jobber, selectJobber } = this.props;
        return (
            <div className="jobber-row">
                <div className={"avatar" + (jobber.is_selected?" is-selected":"") + (!jobber.avatar?" no-border":"")} onClick={() => selectJobber(jobber)}>
                    <img src={jobber.is_selected?"/static/images/icons/icon-check-green.svg":(jobber.avatar?jobber.avatar:"/static/images/avatar.png")} alt="" />
                </div>
                <div className="left-wrapper">
                    <div className="name">{jobber.first_name} {jobber.last_name}</div>
                    <div className="name">{jobber.company}</div>
                    <Score score={jobber.review.score} />
                    
                </div>
                <div className="right-wrapper">
                    <div className="action">
                        <img src="/static/images/icons/icon-comment.svg" alt="" onClick={() => this.gotoChatRoom()}/>
                        <img src="/static/images/icons/icon-briefcase.svg" alt="" onClick={() => this.gotoProfile()}/>
                        <img src={jobber.is_favorite?"/static/images/icons/icon-star-green.svg":"/static/images/icons/icon-star.svg"} alt="" onClick={() => this.handleFavorite()}/>
                    </div>
                    <br></br>
                    <div className="rate">
                        {jobber.review.number_of_feedback === '0' ?
                            'No ' : `${(100 * parseInt(jobber.review.number_of_success) / parseInt(jobber.review.number_of_feedback)).toFixed(2)}% `
                        }
                        Completion rate
                    </div>
                </div>
            </div>
        );
    }
}

Jobber.propTypes = {
    jobId: PropTypes.string.isRequired,
    jobber: PropTypes.object.isRequired,
    selectJobber: PropTypes.func.isRequired,
    gotoChatRoom: PropTypes.func.isRequired,
    gotoProfile: PropTypes.func.isRequired,
    getChatRoomByJobber: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors, { ...actions.chats}
)(Jobber);