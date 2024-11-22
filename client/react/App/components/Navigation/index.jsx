import React, { Component } from "react";
import connect from 'react-redux/es/connect/connect';
import PropTypes from "prop-types";
import items from "./items";
import navs from "./_navs";
import selectors from './selectors';
import actions from '../../actions';
import { Link, withRouter } from 'react-router-dom';
import { paths, constant } from "../../../../../utils";
import Pusher from 'pusher-js';
import qs from 'query-string';
import { isEmpty } from 'lodash';

import { Menu, Sidebar } from '../';
import { Support } from '../';


class Navigation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMenu: false,
            showSideMenu: false,
            showHelpMenu: false,
            isConfirmModal: false,
            title: null,
            isHamburger: true,
            showSupport: false,
            authUser: null,
            badgeCount: {},
            faqItems: []
        }
        this.pusher = new Pusher(process.env.PUSHER_PUB_KEY, {
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true
        });

    }

    componentDidMount() {
        const { getBadgeCount, history: { push } } = this.props;
        const authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
        if (!authUser) {
            push(paths.client.APP_LOGIN);
        } else {
            this.setState({authUser});
            this.initPusher(`user-${authUser.id}`);
            getBadgeCount();
            this.isExistSearchParams();
            this.getFaqData();
        }

        document.body.addEventListener('click', (e) => {
            if (e.target.classList[0] !== 'help-board') {
                this.setState({showHelpMenu: false});
            }
        });
    }

    getFaqData = () => {
        const self = this;
        fetch('../static/data/faq.json'
        ,{
          headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           }
        })
        .then(function(response){
            return response.json();
          })
          .then(function(myJson) {
            self.setState({faqItems: myJson});
          });
    }

    isExistSearchParams = () => {
        const { location: {search} } = this.props;
        const searchParams = qs.parse(search);
        this.setState({isHamburger: !isEmpty(searchParams)?false:true});
    }

    initPusher = (channelId) => {
        const channel = this.pusher.subscribe(channelId);
        channel.bind('badge', this.updateEvent);
    }

    updateEvent = (data) => {
        const { updateBadgeCount } = this.props;
        updateBadgeCount(data);
    }

    getNavClassName = (item) => {
        const { location: { pathname } } = this.props;
        if (item.url === pathname) {
            return 'active';
        } else if (item.name === 'My Calendar' && pathname === '/app/schedule') {
            return 'active';
        } else if (item.name === 'Dashboard' && (pathname === '/app/offers' || pathname === '/app/contracts' || pathname === '/app/invites')) {
            return 'active';
        } else if (item.children) {
            for (let i = 0; i < item.children.length; i ++) {
                if (item.children[i].url === pathname)
                    return 'active';
            }
        }

        return null;
    };

    showMenu = (ev) => {
        ev.stopPropagation();
        this.setState({showMenu: !this.state.showMenu})
    }

    showHideHelp = (ev) => {
        ev.stopPropagation();
        this.setState({showHelpMenu: !this.state.showHelpMenu})
    }

    showSideBar = (ev) => {
        ev.preventDefault();
        const { history: {goBack}} = this.props;
        const { isHamburger } = this.state;
        if(isHamburger)
            this.setState({showSideMenu: true});
        else 
            goBack();
    }

    showSupportDialog = () => {
        this.setState({showSupport: true});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.badgeCount !== prevProps.badgeCount) {
            // console.log(this.props.badgeCount)
        }

        if(this.props.location !== prevProps.location) {
            this.isExistSearchParams();
        }
    }

    render() {
        const {children, location: {pathname, search}, badgeCount} = this.props;
        const {showSideMenu, showSupport, isHamburger, authUser, showHelpMenu, faqItems} = this.state;

        const navBadge = (name) => {
            if(name === 'Chats' && badgeCount.message_count && badgeCount.message_count.length > 0) {
                const unreadMessages = badgeCount.message_count.filter(el=>el.unread_count !== 0);
                if(unreadMessages.length > 0){
                    let unread_count = 0;
                    for(let i = 0; i < unreadMessages.length; i += 1) {
                        unread_count += unreadMessages[i].unread_count;
                    }
                    return (
                        <div className="badge-count">
                            {unread_count}
                        </div>
                    );
                }else
                    return null
            }else if(name === 'Invoices' && badgeCount.invoice_count) {
                return (
                    <div className="badge-count">
                        {badgeCount.invoice_count}
                    </div>
                )
            }else if(name === 'Dashboard') {
                const inviteCount = badgeCount.invite_count?badgeCount.invite_count:0;
                const contractCount = badgeCount.contract_count?badgeCount.contract_count:0;
                const jobCount = badgeCount.job_update_count?badgeCount.job_update_count:0;
                const offerCount = badgeCount.offers_count?badgeCount.offers_count:0;
                const dashboardBadge = inviteCount + contractCount + jobCount + offerCount;
                if(dashboardBadge > 0) {
                    return (
                        <div className="badge-count">
                            {dashboardBadge}
                        </div>
                    )
                }else
                    return null;
            }
        }

        const navItem = (item, key) => {
            return (
                <li key={key} className="nav-item">
                    <Link to={item.url} className={this.getNavClassName(item)}>{item.name}</Link>
                    {navBadge(item.name)}
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

        let nav_title = navs[pathname + search];
        if(!nav_title) {
            const notificationDetail = (new URLSearchParams(search)).get("notification");
            if(notificationDetail === 'jobDetail')
                nav_title = "Job Detail";
            else if(notificationDetail === 'offerDetail')
                nav_title = "Offer Detail";
            else if(notificationDetail === 'contractDetail') 
                nav_title = "Contract Detail";
        }

        const showFaqItems = (items) => {

            let pageFaqItems = [];

            if (pathname == '/app') { // The Dashboard

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'The Dashboard')));

            } else if (pathname == '/app/new-job') { // Create a job

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Creating a Job')));

            } else if (pathname == '/app/jobs') { // Job Offers

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Searching for Jobs')));
            
            } else if (pathname == '/app/offers') { // Job Offers

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Job Offers')));

            } else if (pathname == '/app/contracts') { // Job Contracts

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Job Contracts')));

            } else if (pathname == '/app/invites') { // Jobber Invites

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Job Invites')));

            } else if (pathname == '/app/schedule') { // View calendar

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'My Calendar')));
            
            } else if (pathname == '/app/messages') { // View or create chats

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Chats')));

            } else if (pathname == '/app/invoices') { // View invoices

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Invoices')));

            // } else if (pathname == 'app/reports') { // View reports

            } else if (pathname == '/app/profile') { // Edit profile

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'My Profile')));
            
            } else if (pathname == '/app/payment-method') { // Edit payment methods

                pageFaqItems.push(items?.find(item => (item.helpTopic == 'Payment Details')));
            }

            return pageFaqItems;
        }

        return (
            <div className="app">
                {showSupport?<Support isOpen={showSupport} handleClose={() => this.setState({showSupport: false})}/>:null}
                <nav className="navbar navbar-fixed-top" >
                    <div className="navbar-menu">
                        <img src={isHamburger?"/static/images/icons/icon-menu.svg":"/static/images/icons/icon-back.svg"} alt="Hamburger Menu" onClick={this.showSideBar} />
                    </div>
                    <div className="navbar-title">
                        {nav_title}
                    </div>
                    <div className="navbar-brand">
                        <Link exact to={paths.client.APP_BASE}>
                            <img src="/static/images/logo-white/logo.png" alt="Crew Pond Logo" />
                        </Link>
                    </div>
                    <ul className="nav navbar-nav">
                        {items.map((item, index) => {
                            return navItem(item, index);
                        })}
                    </ul>
                    <div className="notification-nav">
                        <Link exact to={paths.client.APP_NOTIFICATIONS}>
                            <img src="/static/images/icons/icon-notification.svg" alt="Notification"/>
                        </Link>
                        {badgeCount.notification_count > 0?
                        <div className="badge-count">
                            {badgeCount.notification_count}
                        </div>:null}
                        <button className="help-board help-button" onClick={this.showHideHelp}>
                            <img className="help-board" src="/static/images/icons/icon-help.svg" alt="Help"/>
                        </button>
                        {this.state.showHelpMenu ? 
                         <div className='help-board card menu-card-alt'>
                            {faqItems? showFaqItems(faqItems)?.map((item) => {
                            
                                return (<>
                                {item.helpTopic && <p className="help-board help-menu-header">{item.helpTopic}</p>}
                                {item?.topicQA.map(qaItem => {
                                    if (qaItem.answerLink) {
                                            return (
                                                <p className="help-board help-menu-item"><span className="help-board">Q: {qaItem.question}</span><br/>
                                                A: {qaItem.answerLink && <a onClick={this.showHideHelp} href={qaItem.answerLink} target="_blank">{qaItem.answerLink}</a>}</p>
                                            )
                                    }
                                })}
                            </>) 
                            }) : null }
                            <p className="help-board">For more help topics, please visit our <u><Link to="/app/faq">FAQ page</Link></u></p>
                        </div> : null}
                    </div>
                    <div className="user-nav" onClick={this.showMenu}>
                        <img src={authUser&&authUser.avatar?authUser.avatar:"/static/images/avatar.png"} alt=""/>
                        <div className="user-name">
                            {authUser ? authUser.first_name + " " + authUser.last_name: ""}
                        </div>
                    </div>
                    {this.state.showMenu ? <Menu showMenu={this.showMenu} showSupportDialog={this.showSupportDialog}/> : null}
                </nav>
                <Sidebar {...this.props} className={showSideMenu?'open':'close'} closeMenu={() => this.setState({showSideMenu: false})} showSupportDialog={this.showSupportDialog}/>
                <main className="main">
                    {children}
                </main>
            </div>
        );
    }
} 

Navigation.propTypes = {
    payoutExtraUser: PropTypes.func.isRequired,
    getBadgeCount: PropTypes.func.isRequired,
    updateBadgeCount: PropTypes.func.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
    children: PropTypes.element.isRequired,
    isSubmittingExtraUser: PropTypes.bool,
    navbarParams: PropTypes.object.isRequired,
    badgeCount: PropTypes.object.isRequired,
};

export default connect(
    selectors,
    { 
        ...actions.settings,
        ...actions.payments,
        ...actions.notifications
    }
)(withRouter(Navigation));