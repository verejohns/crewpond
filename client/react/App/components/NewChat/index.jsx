import React, { Component } from "react";
import Jobber from './jobber';
import PerfectScrollbar from 'react-perfect-scrollbar';
import InfiniteScroll from 'react-infinite-scroller';
import { Modal, ModalBody} from 'reactstrap';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Loader } from "../../../components";
import { toast } from 'react-toastify';

import connect from "react-redux/es/connect/connect";
import selectors from "./selectors";
import actions from "../../actions";
import PropTypes from "prop-types";
import {merge} from 'lodash';
import 'react-tabs/style/react-tabs.css';

class NewChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chat_name: '',
            jobbers: [],
            favorites: [],
            isOpen: false,
            isFavoritesLoading: false,
            isJobbersLoading: false
        };
        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
    }
    componentDidMount() {
        this.loadFavoriteJobbers();
        this.loadJobbers();
    }

    loadFavoriteJobbers = () => {
        const { getFavoriteJobbers, getFavoriteUsers, isGroupChat, jobId } = this.props;
        this.setState({isFavoritesLoading: true})
        // if(!isGroupChat)
        //     getFavoriteJobbers(jobId)
        //     .then(({result: {data}}) => {
        //         this.setState({
        //             favorites: data.favorites,
        //             isFavoritesLoading: false
        //         });
        //     });
        // else
            getFavoriteUsers({
                limit: this.limit,
                orderBy: this.orderBy,
                lastValue: this.lastValue,
            }).then(({result: {data}}) => {
                this.setState({favorites: data.users, isFavoritesLoading: false});
                this.lastVaue = data.lastValue;
            });
    }

    loadMoreUsers = () => {
        const { getFavoriteUsers } = this.props;
        if(this.lastValue)
            getFavoriteUsers({
                limit: this.limit,
                orderBy: this.orderBy,
                lastValue: this.lastValue,
            }).then(({result: {data}}) => {
                let favorites = this.state;
                favorites = favorites.concat(data.users);
                this.setState({favorites});
                this.lastValue = data.lastValue;
            });
    };

    loadJobbers = () => {
        const { jobId, getJobbers, isGroupChat} = this.props;
        if(!isGroupChat)
            getJobbers(jobId)
            .then(({result: {data}}) => {
                this.setState({
                    jobbers: data.jobbers,
                    isJobbersLoading: false
                })
            });
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.isOpen !== nextProps.isOpen){
            this.setState({
                isOpen: nextProps.isOpen
            });
        }
    }

    selectJobber(jobber) {
        let { jobbers } = this.state;
        const index = jobbers.findIndex(el=>el.id === jobber.id);
        if(jobber.is_selected)
            merge(jobber, {is_selected: false});
        else 
            merge(jobber, {is_selected: true});
        jobbers[index] = jobber;
        this.setState({jobbers});
    }

    handleInputChange(event) {
        this.setState({
            chat_name: event.target.value
        });
    }

    gotoProfile(user_id) {
        const {history: {push}} = this.props;
        push(paths.build(paths.client.APP_JOBBER_PROFILE, user_id));
    }

    handleCreateRoom(event) {
        event.preventDefault()
        const {handleCreateRoom, isGroupChat} = this.props;
        const {chat_name, jobbers, favorites} = this.state;
        if(isGroupChat && chat_name.length === 0){
            toast.error("Chat title is empty");
            return;
        }
        handleCreateRoom(chat_name, jobbers, favorites, isGroupChat)
    }

    render() {
        const { gotoChatRoom, jobId, handleClose, history, isGroupChat } = this.props;
        const { chat_name, jobbers, favorites, isOpen, isFavoritesLoading, isJobbersLoading } = this.state;

        return (
            <Modal isOpen={isOpen} className="new-chat-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleClose}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">New Chat</h5>
                    <form>
                        <div className="row">
                            <div className="col-12 form-group">
                                <label className="medium">Chat name</label>
                                <div>
                                    <input type="text" className="chat-name form-control" placeholder="Type the name of chat" value={chat_name} onChange={(event) => this.handleInputChange(event)}></input>
                                </div>
                            </div>
                        </div>
                        <label className="medium">{!isGroupChat?"Select Participants":"Favorite Jobbers"}</label>
                        {!isGroupChat?<Tabs>
                            <TabList>
                                <Tab className="jobbers-tab" selectedClassName="selected-jobbers-tab">Jobbers</Tab>
                                <Tab className="jobbers-tab" selectedClassName="selected-jobbers-tab">Favourite Jobbers</Tab>
                            </TabList>

                            <TabPanel>
                                <PerfectScrollbar
                                    ref={(ref) => {this.userScrollBarRef = ref;}}
                                    options={{
                                        suppressScrollX: true
                                    }}
                                >
                                    {(isJobbersLoading)?<Loader />:
                                        (jobbers.length > 0?jobbers.map((jobber, key) => {
                                            return <Jobber jobber={jobber} key={key} jobId={jobId} selectJobber={() => this.selectJobber(jobber)} history={history}
                                                        gotoChatRoom={gotoChatRoom} gotoProfile={(id) => this.gotoProfile(id)}/>
                                        }):"No Jobbers")
                                    }
                                </PerfectScrollbar>
                            </TabPanel>
                            <TabPanel>
                                <PerfectScrollbar
                                    ref={(ref) => {this.userScrollBarRef = ref;}}
                                    options={{
                                        suppressScrollX: true
                                    }}
                                >
                                    {(isFavoritesLoading)?<Loader />:
                                        (favorites&&favorites.length > 0?favorites.map((jobber) => {
                                            return <Jobber jobber={jobber} key={jobber.id} jobId={jobId} selectJobber={() => this.selectJobber(jobber)} history={history}
                                                        gotoChatRoom={gotoChatRoom} gotoProfile={(id) => this.gotoProfile(id)}/>
                                        }):"No Favorite Jobbers")
                                    }
                                </PerfectScrollbar>
                            </TabPanel>
                        </Tabs>:
                            <PerfectScrollbar
                                ref={(ref) => {this.userScrollBarRef = ref;}}
                                options={{
                                    suppressScrollX: true
                                }}
                            >
                                <InfiniteScroll
                                    pageStart={0}
                                    hasMore={true||false}
                                    useWindow={false}
                                    loader={<div className="load-more" onClick={this.loadMoreUsers}>Load More</div>}
                                >
                                    {favorites.map((jobber) => {
                                        return <Jobber jobber={jobber} key={jobber.id} jobId={jobId} selectJobber={() => this.selectJobber(jobber)} history={history}
                                                    gotoChatRoom={gotoChatRoom} gotoProfile={(id) => this.gotoProfile(id)}/>
                                    })}
                                </InfiniteScroll>
                            </PerfectScrollbar>}
                        <div className="footer">
                            <button className="btn btn-block btn-success" onClick={(event) => this.handleCreateRoom(event)}>Create</button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        );
    }
}

NewChat.defaultProps = {
    isOpen: false,
    jobbers: [],
    favorites: [],
    isGroupChat: false
};

NewChat.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isGroupChat: PropTypes.bool.isRequired,
    handleCreateRoom: PropTypes.func.isRequired,
    getFavoriteUsers: PropTypes.func.isRequired,
    gotoChatRoom: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    getFavoriteJobbers: PropTypes.func.isRequired,
    getJobbers: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired
};

export default connect(
    selectors,
    { 
        ...actions.jobs,
        ...actions.favorite,
        ...actions.users
    }
)(NewChat);
