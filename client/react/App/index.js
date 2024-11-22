import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { ToastContainer } from 'react-toastify';
import 'bootstrap';

import { paths } from "../../../utils";
import { middleware, middleware_multipart, reducers } from './store';
import "../components/extra";
import { Navigation } from "./components";

import {
    Login,
    Register,
    Forgot,
    Reset,
    Dashboard,
    Offers,
    Contracts,
    Jobs,
    NewJob,
    Notifications,
    Security,
    Invites,
    Messages,
    Schedules,
    Profile,
    Invoices,
    PaymentMethod,
    Subscriptions,
    Reports,
    InviteRequest,
    Faq,
    TermsConidition,
    WorkingHours,
    SubUsers,
    WebSubscription
} from "./containers";

// Import Main styles for this application
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../scss/style.scss';
import './scss/style.scss';


const store = createStore(reducers, applyMiddleware(thunk, middleware(), middleware_multipart()));

window.onload = () => {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={createBrowserHistory()}>
            {/*<Router history={createBrowserHistory({*/}
            {/*    getUserConfirmation(message, callback) {*/}
            {/*        const container = document.createElement('div');*/}
            {/*        container.setAttribute('custom-confirmation-navigation', '');*/}
            {/*        document.body.appendChild(container);*/}
            {/*        const closeModal = (callbackState) => {*/}
            {/*            ReactDOM.unmountComponentAtNode(container);*/}
            {/*            callback(callbackState);*/}
            {/*        };*/}
            {/*        ReactDOM.render(*/}
            {/*            <Provider store={store}>*/}
            {/*                <ConfirmActionModal*/}
            {/*                    title="Confirmation"*/}
            {/*                    text={message}*/}
            {/*                    onConfirm={() => closeModal(true)}*/}
            {/*                    onClose={() => closeModal(true)}*/}
            {/*                    show*/}
            {/*                    isSaveConfirmModal*/}
            {/*                />*/}
            {/*            </Provider>,*/}
            {/*            container,*/}
            {/*        );*/}
            {/*    }})}*/}
            {/*>*/}
                <React.Fragment>
                    <ToastContainer position="top-right" autoClose={5000} style={{ zIndex: 1999 }} />

                    <Switch>
                        <Route exact path={paths.client.APP_LOGIN} component={Login} />
                        <Route exact path={paths.client.APP_REGISTER} component={Register} />
                        <Route exact path={paths.client.APP_FORGOT_PASSWORD} component={Forgot} />
                        <Route exact path={paths.client.APP_RESET_PASSWORD} component={Reset} />
                        <Route exact path={paths.client.APP_WEB_SUBSCRIPTION} component={WebSubscription} />

                        <Navigation>
                            <Switch>
                                <Route exact path={paths.client.APP_BASE} component={Dashboard} />
                                <Route exact path={paths.client.APP_OFFERS} component={Offers} />
                                <Route exact path={paths.client.APP_CONTRACTS} component={Contracts} />
                                <Route exact path={paths.client.APP_INVITES} component={Invites} />
                                <Route exact path={paths.client.APP_JOBS} component={Jobs} />
                                <Route exact path={paths.client.APP_NEW_JOB} component={NewJob} />
                                <Route exact path={paths.client.APP_EDIT_JOB} component={NewJob} />
                                <Route exact path={paths.client.APP_NOTIFICATIONS} component={Notifications} />
                                <Route exact path={paths.client.APP_SECURITY} component={Security} />
                                <Route exact path={paths.client.APP_MESSAGES} component={Messages} />
                                <Route exact path={paths.client.APP_SCHEDULE} component={Schedules} />
                                <Route exact path={paths.client.APP_PROFILE} component={Profile} />
                                <Route exact path={paths.client.APP_INVOICES} component={Invoices} />
                                <Route exact path={paths.client.APP_PAYMENT_METHOD} component={PaymentMethod} />
                                <Route exact path={paths.client.APP_SUBSCRIPTIONS} component={Subscriptions} />
                                <Route exact path={paths.client.APP_REPORTS} component={Reports} />
                                <Route exact path={paths.client.APP_JOBBER_PROFILE} component={Profile}/>
                                <Route exact path={paths.client.APP_INVITES_REQUEST} component={InviteRequest}/>
                                <Route exact path={paths.client.APP_USER_FAQ} component={Faq}/>
                                <Route exact path={paths.client.APP_USER_TERMS} component={TermsConidition}/>
                                <Route exact path={paths.client.APP_WOKRING_HOURS} component={WorkingHours}/>
                                <Route exact path={paths.client.APP_SUB_USERS} component={SubUsers}/>
                                <Route exact path={paths.client.APP_SUPPORT} component={() => {
                                        window.location.href = 'https://m.facebook.com/groups/326198294734521/#_=_';
                                        return null;
                                    }}/>

                            </Switch>
                        </Navigation>
                    </Switch>
                </React.Fragment>
            </Router>
        </Provider>
        , document.getElementById('app'),
    );
};
