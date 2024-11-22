import React, { Component } from "react";
import PropTypes from "prop-types";
import {Switch} from "../index";

class UserDetailCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { data } = this.props;
        return (
            <div className="card user-detail-card">
                <div className="card-body">
                    <div className="header">
                        <div className="center-wrapper">
                            <div className="image">
                                <img src="/static/images/job-1-avatar.png" alt="" />
                            </div>
                            <div className="user-name">
                                <span><h4>{data.first_name + ', ' + data.last_name}</h4></span>
                                <span className="chat-member-status"><h4>{data.company}</h4></span>
                            </div>
                        </div>
                    </div>
                    <div className="description">
                        {data.description}
                    </div>
                </div>
            </div>
        );
    }
}

UserDetailCard.propTypes = {
    data: PropTypes.object
};

export default UserDetailCard;
