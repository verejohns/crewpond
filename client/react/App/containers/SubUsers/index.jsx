import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import actions from '../../actions';
import selectors from './selectors';
import { merge } from 'lodash';
import { functions, messages, constant } from "../../../../../utils";

import {toast} from 'react-toastify';
import { Loader, UserCard, ConfirmDialog } from "../../components";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Modal, ModalBody} from 'reactstrap';
import User from './user';
import PerfectScrollbar from 'react-perfect-scrollbar';

class SubUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            jobbers: [],
            favorites: [],
            isLoadingUsers: false,
            isLoadingFavorites: false,
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT)),
            isConfirmModal: false
        };

        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;
    }

    componentDidMount() {
        const { getSubUsers } = this.props;
        getSubUsers();
    }

    handleClick = (ev) => {
        ev.preventDefault();
    }

    onDeleted = () => {
        const { getSubUsers } = this.props;
        getSubUsers();
    }

    closeConfirmModal = () => {
        this.setState({
            isConfirmModal: false
        })
    }

    handleAddSubUsers = () => {
        const { jobbers, favorites } = this.state;
        const { addSubUsers, getSubUsers } = this.props;
        const jobber_ids = jobbers.filter((el) => {
            if(el.is_selected)
                return true;
            else
                return false;
        }).map(el=>el.id);
        const favorite_ids = favorites.filter((el) => {
            if(el.is_selected)
                return true;
            else
                return false;
        }).map(el=>el.id);
        let user_ids = functions.merge_array(jobber_ids, favorite_ids);

        addSubUsers(user_ids)
        .then(() => {
            getSubUsers();
            this.setState({
                isOpen: false,
                isConfirmModal: false
            });
        }).catch(({ response: { data } }) => {
            if (data.errorCode === 61)
                return toast.error(messages.NO_PAYMENT_METHOD);
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    handleClose = () => {
        this.setState({isOpen: false});
    }

    selectUser = (jobber) => {
        let { jobbers, favorites } = this.state;
        if(jobber.sub_accounts === 1) {
            return toast.error(messages.ALREADY_SUB_USER);
        }
        //get id of selected from jobbers and favorites
        const j_id = jobbers.findIndex(el=>el.id === jobber.id);
        const f_id = favorites.findIndex(el=>el.id === jobber.id);

        if(jobber.is_selected)
            merge(jobber, {is_selected: false});
        else
            merge(jobber, {is_selected: true});
        if(j_id > -1) {
            jobbers[j_id] = jobber;
        }
        if(f_id > -1) {
            favorites[f_id].is_selected = true;
        }
        this.setState({jobbers, favorites});
    }

    handleOpenModal = (ev) => {
        ev.preventDefault();
        this.setState({
            isLoadingUsers: true,
            isLoadingFavorites: true,
            jobbers: [],
            favorites: [],
        })
        this.loadUsers();
        this.loadFavorites();
        this.setState({isOpen: true});
    }

    loadUsers = () => {
        const { getUsers } = this.props;
        getUsers({
            orderBy: 'id',
            limit: 10,
            lastValue: this.lastValue
        }).then(({ result: { data } }) => {
            const { users, lastValue } = data;
            const jobbers = this.state.jobbers.concat(users);
            this.lastValue = lastValue;
            this.setState({jobbers, isLoadingUsers: false});
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    loadMoreUsers = () => {
        if(this.lastValue){
            this.loadUsers();
        }
    }

    loadFavorites = () => {
        const {getFavoriteUsers} = this.props;
        getFavoriteUsers({
            orderBy: this.orderBy
        }).then(({ result }) => {
            let { favorites } = this.state;
            favorites = favorites.concat(result.data.users);
            this.setState({ favorites, isLoadingFavorites: false });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    renderModal() {
        const {history} = this.props;
        const { isOpen, jobbers, favorites, isLoadingUsers, isLoadingFavorites } = this.state;
        return (
            <Modal isOpen={isOpen} className="sub-user-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={this.handleClose}/>
                </div>

                <ModalBody>
                    <Tabs>
                        <TabList>
                            <Tab className="jobbers-tab" selectedClassName="selected-jobbers-tab">Jobbers</Tab>
                            <Tab className="jobbers-tab" selectedClassName="selected-jobbers-tab">Favourite Jobbers</Tab>
                        </TabList>

                        <TabPanel>
                            <PerfectScrollbar className="jobber-list">
                                {isLoadingUsers?<Loader/>:(jobbers.length > 0?jobbers.map((jobber) => {
                                    return <User user={jobber} key={jobber.id} selectUser={() => this.selectUser(jobber)} history={history}/>
                                }):"No Jobbers")}
                                {this.lastValue?
                                <div className="list-footer">
                                    <div className="load-more" onClick={this.loadMoreUsers}>Load More</div>
                                </div>:null}
                            </PerfectScrollbar>
                        </TabPanel>
                        <TabPanel>
                            <PerfectScrollbar className="jobber-list">
                                {isLoadingFavorites?<Loader/>:(favorites.length > 0?favorites.map((jobber) => {
                                    return <User user={jobber} key={jobber.id} selectUser={() => this.selectUser(jobber)} history={history}/>
                                }):"No Favorite Jobbers")}
                            </PerfectScrollbar>
                        </TabPanel>
                    </Tabs>
                    <div className="footer">
                        <button className="btn btn-block btn-success" onClick={() => this.setState({isConfirmModal: true})}>Add Users</button>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    render() {
        const { sub_users, isLoading, history } = this.props;
        const { authUser, isConfirmModal } = this.state;
        let content = null;
        if (!isLoading && sub_users.length === 0) {
            content = (
                <h3 className="text-center">
                    {messages.NO_DATA}
                </h3>
            )
        } else {
            content = (
                <div className="row">
                    {sub_users.map((item) => {
                        return (
                            <div className="col-12 mb-3" key={item.id}>
                               <UserCard history={history} data={item} onDeleted={this.onDeleted}></UserCard>
                            </div>
                        );
                    })}
                    {isLoading ?
                        <div className="col-12 mt-5">
                            <Loader />
                        </div> : null
                    }
                </div>
            );
        }

        return (
            <React.Fragment>
                {/* {this.renderModal()}
                <ConfirmDialog isOpen={isConfirmModal} description={messages.SUB_USER_SUBSCRIPTION} ok="Yes" cancel="No" onOk={this.handleAddSubUsers} onCancel={this.closeConfirmModal}/>
                <div className="page-header">
                    <div className="header-container">
                        <div className="action-wrapper">
                            <div className="title">{authUser&&authUser.sub_accounts === 0?"Teammates":"Super Users"}</div>
                            {authUser&&authUser.sub_accounts === 0?<button className="btn btn-outline-success" onClick={this.handleOpenModal}>Add Teammate</button>:null}
                        </div>
                    </div>
                </div>
                <div className="page-content">
                    <div className="container">
                        {content}
                    </div>
                </div> */}
            </React.Fragment>
        )
    }
}

SubUsers.propTypes = {
    getSubUsers: PropTypes.func,
    addSubUsers: PropTypes.func,
    getUsers: PropTypes.func,
    getFavoriteUsers: PropTypes.func,
    sub_users: PropTypes.array,
    isLoading: PropTypes.bool,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired
};

export default  connect(
    selectors,
    {...actions.users}
)(SubUsers);
