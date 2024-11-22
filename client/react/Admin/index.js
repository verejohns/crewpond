import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Provider from 'react-redux/es/components/Provider';
import { ToastContainer } from 'react-toastify';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import '../components/extra';
import { middleware, reducers } from './store';

// Import Main styles for this application
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './scss/style.scss';

import Navigation from './containers/Navigation';
import Login from './views/Login';
import Pages from './views/Pages';

import { paths } from '../../../utils';


const store = createStore(reducers, applyMiddleware(thunk, middleware()));

window.onload = () => {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={createBrowserHistory()}>
                <React.Fragment>
                    <Switch>
                        <Route exact path={paths.client.ADMIN_LOGIN} component={Login} />
                        <Navigation>
                            <ToastContainer/>
                            <Switch>
                                <Route exact path={paths.client.ADMIN_DASHBOARD} component={Pages.Dashboard} />
                                <Route exact path={paths.client.ADMIN_USERS} component={Pages.Users} />
                                <Route exact path={paths.client.ADMIN_JOBS} component={Pages.Jobs} />
                                <Route exact path={paths.client.ADMIN_SUBS} component={Pages.Payments} />
                                <Route exact path={paths.client.ADMIN_CHAT} component={Pages.Chat} />
                                <Route exact path={paths.client.ADMIN_EDIT_USER} component={Pages.EditUser} />
                                <Route exact path={paths.client.ADMIN_EDIT_JOB} component={Pages.EditJob} />
                                <Route exact path={paths.client.ADMIN_EMAIL} component={Pages.Email} />
                            </Switch>
                        </Navigation>
                    </Switch>
                </React.Fragment>
            </Router>
        </Provider>
        , document.getElementById('app'),
    );
};
