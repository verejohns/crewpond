import React, { Component } from "react";
import { Link, withRouter } from 'react-router-dom';
import {
  NavbarToggler,
} from 'reactstrap';
import PropTypes from "prop-types";
import { paths } from "../../../../../utils";
import { DropDownMenu } from '..';
import items from "./items";

class Header extends Component {
    constructor(props) {
        super(props);
    }

    getNavClassName = (item) => {
        const { location: { pathname } } = this.props;
        if (item.url === pathname) {
            return 'active';
        } else if (item.children) {
            for (let i = 0; i < item.children.length; i ++) {
                if (item.children[i].url === pathname)
                    return 'active';
            }
        }

        return null;
    };

    mobileSidebarToggle(e) {
        e.preventDefault();
        document.body.classList.toggle('sidebar-mobile-show');
    }
    
    mobileSidebarToggle(e) {
        e.preventDefault();
        document.body.classList.toggle('sidebar-mobile-show');
    }

    render() {
        const navItem = (item, key) => {
            return (
                <li key={key} className="nav-item">
                    <Link exact to={item.url} className={this.getNavClassName(item)}>{item.name}</Link>

                    {item.children ?
                        <ul className="nav navbar-dropdown">
                            {item.children.map((s_item, s_index) => {
                                return navItem(s_item, s_index);
                            })}
                        </ul> : null
                    }
                </li>
            );
        };

        return (
            <React.Fragment>
                <nav className="navbar navbar-fixed-top" >
                    <button type="button" className="d-lg-none navbar-toggler" onClick={this.mobileSidebarToggle}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="navbar-brand">
                        <Link exact to={paths.client.ADMIN_DASHBOARD}>
                            <img src="/static/images/logo-white/logo.png" alt="Crew Pond Logo" />
                        </Link>
                    </div>
                    <ul className="nav navbar-nav">
                        {items.map((item, index) => {
                            return navItem(item, index);
                        })}
                    </ul>
                    <div className="user-nav">
                        <DropDownMenu/>
                    </div>
                </nav>
            </React.Fragment>
        );
    }
}

Header.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired
};

export default (withRouter(Header));
