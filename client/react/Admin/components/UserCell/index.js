import React, { Component } from "react";
import PropTypes from "prop-types";

class UserCell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            avatar: null,
            first_name: null,
            last_name: null,
            company: null,
            description: null
        };
    }

    componentDidMount() {
        const { user } = this.props;

        this.setState({
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
            company: user.company,
            description: user.description
        });
    }

    render() {
        const { onClick, user } = this.props;
        const {avatar, first_name, last_name, company, description} = this.state;
        return (
            <div className="user-row" onClick={() => onClick(user)}>
                <div className="avatar">
                    <img src={avatar} alt="" />
                </div>
                <div className="info">
                    <div className="username">{first_name + " " + last_name}</div>
                    <div className="company">{company}</div>
                    <div className="description">{description}</div>
                </div>
            </div>
        );
    }
}

UserCell.propTypes = {
    user: PropTypes.object,
    onClick: PropTypes.func
};

export default UserCell;
