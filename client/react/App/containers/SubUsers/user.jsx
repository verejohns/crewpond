import React, { Component } from "react";
import PropTypes from "prop-types";
import { paths } from "../../../../../utils";

import { Score } from '../../../components';

class User extends Component {
    gotoProfile = () => {
        const {history: {push}, user} = this.props;
        push(paths.build(paths.client.APP_JOBBER_PROFILE, user.id))
    }

    render() {
        const { user, selectUser } = this.props;
        return (
            <div className="jobber-row">
                <div className={"avatar" + (user.is_selected?" is-selected":"") + (!user.avatar?" no-border":"")} onClick={() => selectUser(user)}>
                    <img src={user.is_selected?"/static/images/icons/icon-check-green.svg":(user.avatar?user.avatar:"/static/images/avatar.png")} alt="" />
                </div>
                <div className="left-wrapper">
                    <div className="name">{user.first_name} {user.last_name}</div>
                    <div className="name">{user.company}</div>
                    <Score score={user.review.score} />
                    
                </div>
                <div className="right-wrapper">
                    <div className="action">
                        <img src="/static/images/icons/icon-briefcase.svg" alt="" onClick={() => this.gotoProfile()}/>
                    </div>
                    <br></br>
                    <div className="rate">
                        {user.review.number_of_feedback === '0' ?
                            'No ' : `${(100 * parseInt(user.review.number_of_success) / parseInt(user.review.number_of_feedback)).toFixed(2)}% `
                        }
                        Completion rate
                    </div>
                </div>
            </div>
        );
    }
}

User.propTypes = {
    user: PropTypes.object.isRequired,
    selectUser: PropTypes.func.isRequired,
    gotoProfile: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default User;