import React, { Component } from "react";
import PropTypes from "prop-types";
import actions from '../../actions';
import connect from 'react-redux/es/connect/connect';
import { paths, messages, constant } from '../../../../../utils';
import { toast } from "react-toastify";
import  { Redirect } from 'react-router-dom'

class SubAccounts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sub_users: [],
            redirect: false
        }
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        this.setState({
            sub_users: JSON.parse(localStorage.getItem(constant.SUB_USERS))
        });
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    /**
     * Alert if clicked on outside of element
     */
    handleClickOutside(event) {
        const {showSubAccounts} = this.props;
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            showSubAccounts(event)
        }
    }

    /**
     * Set the wrapper ref
     */
    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    handleSwitchAccount = (item) => {
        const { switchAccount, history: {push} } = this.props;
        const { sub_users } = this.state;
        switchAccount({main_id: sub_users[0].id, switch_id: item.id})
        .then(({result: {data}}) => {
            const { user, sub_users } = data;
            localStorage.setItem(constant.LOGGED_ACCOUNT, JSON.stringify(user));
            localStorage.setItem(constant.SUB_USERS, JSON.stringify(sub_users));
            location.href = paths.client.APP_BASE;
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    handleLogout = () => {
        const { clearFcmToken } = this.props;
        const token = localStorage.getItem(constant.USER_TOKEN);
        clearFcmToken({platform: 'web', token});
        location.href = '/app/logout';
    }

    render() {
        const { addSubAccount } = this.props;
        const { sub_users, redirect } = this.state;
        if(redirect) {
            return <Redirect to={paths.client.APP_BASE}  />
        }
        return (
            <div className='card subaccounts-card' ref={this.setWrapperRef}>
                
                <img src="/static/images/icons/icon-arrow.svg" className="menu-top-arrow"></img>
                {sub_users.map((item, key) => {
                    return (
                        <div className="account-item" key={key} onClick={() => this.handleSwitchAccount(item)}><div className="avatar"><img src={item.avatar?item.avatar:"/static/images/avatar.png"}/></div>{item.first_name + " " + item.last_name}</div>
                    )
                })}
                
                <div className="divider"></div>

                <div className="account-item" onClick={addSubAccount}><img src="/static/images/icons/icon-add.svg" className="add-new-action"/>Add another account</div>
                <div className="divider"></div>
                <div className="account-item" onClick={this.handleLogout}>Log out all accounts</div>
            </div>
        );
    }
}

SubAccounts.defaultProps = {
};

SubAccounts.propTypes = {
    showSubAccounts: PropTypes.func.isRequired,
    addSubAccount: PropTypes.func.isRequired,
    switchAccount: PropTypes.func.isRequired,
    clearFcmToken: PropTypes.func.isRequired,
    defaultUser: PropTypes.object.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    null,
    {
        ...actions.authentication,
    }
)(SubAccounts);

