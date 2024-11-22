import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem, NavLink as RsNavLink } from 'reactstrap';
import classNames from 'classnames';
import nav from './_nav';
import { constant } from '../../../../../utils';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT))
    }
    this.handleClick = this.handleClick.bind(this);
    this.activeRoute = this.activeRoute.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleClickItem = this.handleClickItem.bind(this);
  }

  handleClickItem(e) {
    e.preventDefault();
    const { showSupportDialog } = this.props;
    if(e.target.id === 'support') {
      showSupportDialog();
    }
  }

  handleClick(e) {
    e.preventDefault();
    e.target.parentElement.classList.toggle('open');
  }

  handleClose(name) {
    if(name === 'Logout') {
      localStorage.clear();
    }
    const {closeMenu} = this.props;
    closeMenu();
  }

  activeRoute(routeName, props) {
    // return this.props.location.pathname.indexOf(routeName) > -1 ? 'nav-item nav-dropdown open' : 'nav-item nav-dropdown';
    return props.location.pathname.indexOf(routeName) > -1 ? 'nav-item nav-dropdown open' : 'nav-item nav-dropdown';
  }

  // todo Sidebar nav secondLevel
  // secondLevelActive(routeName) {
  //   return this.props.location.pathname.indexOf(routeName) > -1 ? "nav nav-second-level collapse in" : "nav nav-second-level collapse";
  // }

  render() {
    const props = this.props;
    const { authUser } = this.state;
    // simple wrapper for nav-title item
    const wrapper = item => (item.wrapper && item.wrapper.element ? (React.createElement(item.wrapper.element, item.wrapper.attributes, item.name)) : item.name);

    // nav list section title
    const title = (title, key) => {
      const classes = classNames('nav-title', title.class);
      return (<li key={key} className={classes}>{wrapper(title)} </li>);
    };

    // nav list divider
    const divider = (divider, key) => {
      const classes = classNames('divider', divider.class);
      return (<li key={key} className={classes} />);
    };

    // nav item with nav link
    const navItem = (item, key) => {
      const classes = {
        item: classNames(item.class),
        link: classNames('nav-link', item.variant ? `nav-link-${item.variant}` : ''),
        icon: classNames(item.icon),
      };
      return (
        navLink(item, key, classes)
      );
    };

    // nav link
    const navLink = (item, key, classes) => {
        const url = item.url ? item.url : null;
        return (
            <NavItem key={key} className={classes.item}>
            { url ?
              <NavLink to={url} className={classes.link} exact activeClassName="active" onClick={() => this.handleClose(item.name)}>
                  <i className={classes.icon} />{item.name}
              </NavLink>
              :
              <a href="#" id={item.key} className={classes.link} onClick={this.handleClickItem}><i className={classes.icon} />{item.name}</a>
            }
            </NavItem>
        );
    };

    // nav dropdown
    const navDropdown = (item, key) => (
      <li key={key} className={this.activeRoute(item.url, props)}>
        <a className="nav-link nav-dropdown-toggle" href="#" onClick={this.handleClick}><i className={item.icon} />{item.name}</a>
        <ul className="nav-dropdown-items">
          {navList(item.children)}
        </ul>
      </li>);

    // nav type
    const navType = (item, idx) =>
      (item.title ? title(item, idx) :
        item.divider ? divider(item, idx) :
          item.children ? navDropdown(item, idx)
            : navItem(item, idx));

    // nav list
    const navList = items => items.map((item, index) => navType(item, index));

    const isExternal = (url) => {
        const link = url ? url.substring(0, 4) : '';
        return link === 'http';
    };
    // sidebar-nav root
    return (
      <div className={"sidebar " + props.className}>
        <div className="sidebar-close" onClick={this.handleClose}>
            <img src="/static/images/icons/icon-left-close.svg"></img>
        </div>
        <div className="sidebar-header">
            <div className={"avatar" + (!(authUser&&authUser.avatar)?" no-border":"")}>
                <img src={authUser&&authUser.avatar?authUser.avatar:'/static/images/avatar.png'}></img>
            </div>
            <div className="user-info">
                <h5>{authUser&&authUser.first_name + " " + authUser&&authUser.last_name}</h5>
                <h6>{authUser&&authUser.company}</h6>
            </div>
        </div>
        <nav className="sidebar-nav">
            
            <Nav>
                {navList(nav.items)}
            </Nav>
        </nav>
      </div>
    );
  }
}

export default Sidebar;
