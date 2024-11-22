import React, { Component } from "react";
import PropTypes from "prop-types";
import {paths} from '../../../../../utils'

class Menu extends Component {
    constructor(props) {
        super(props);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    /**
     * Alert if clicked on outside of element
     */
    handleClickOutside(event) {
        const {showMenu} = this.props;
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            showMenu(event)
        }
    }

    /**
     * Set the wrapper ref
     */
    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    logout= () => {
        localStorage.clear();
        location.href=paths.client.APP_LOGOUT;
    }
    render() {
        const { showSupportDialog } = this.props;
        return (
            <div className='card menu-card' ref={this.setWrapperRef}>
                
                <img src="/static/images/icons/icon-arrow.svg" className="menu-top-arrow"></img>
                <div className="menu-item"><a href={paths.client.APP_PROFILE}>View Profile</a></div>
                <div className="divider"></div>
                <div className="menu-item"><a href={paths.client.APP_SECURITY}>Password and Security</a></div>
                <div className="menu-item"><a href={paths.client.APP_PAYMENT_METHOD}>Payment Options</a></div>
                <div className="menu-item"><a href={paths.client.APP_SUBSCRIPTIONS}>Subscriptions</a></div>
                <div className="menu-item"><a href={paths.client.APP_OFFERS + "?archive=true"}>Archived Folder</a></div>
                {/* <div className="menu-item"><a href={paths.client.APP_SUB_USERS}>Teammates</a></div> */}
                <div className="divider"></div>
                <div className="menu-item" onClick={showSupportDialog}>Support</div>
                <div className="menu-item"><a href={paths.client.APP_USER_FAQ}>Help Topics</a></div>
                <div className="menu-item"><a href={paths.client.APP_USER_TERMS}>Terms and Conditions</a></div>
                <div className="menu-item"><div className="logout" onClick={this.logout}>Logout</div></div>
            </div>
        );
    }
}

Menu.defaultProps = {
};

Menu.propTypes = {
    showMenu: PropTypes.func.isRequired,
    showSupportDialog: PropTypes.func.isRequired,
};

export default Menu;
