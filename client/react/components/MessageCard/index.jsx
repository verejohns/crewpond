import React, { Component } from "react";
import {DelayInput} from 'react-delay-input';
import PropTypes from "prop-types";
import moment from 'moment';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { constant } from '../../../../utils'
import Pusher from 'pusher-js';

import PerfectScrollbar from 'react-perfect-scrollbar';
import InfiniteScroll from 'react-infinite-scroller';
import UserCell from "./userCell";
import {Lightbox} from "react-modal-image";
import parse from 'html-react-parser';
import { Loader } from '../../components';

import 'react-perfect-scrollbar/dist/css/styles.css';

class MessageCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            isOpenImage: false,
            image: null,
            messages: [],
            selected_room: null,
            avatar: null,
            group_avatar: null,
            title: '',
            channelName: null,

            keyword: '',
            sel_user: null,
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT))
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleNewChatModal = this.handleNewChatModal.bind(this);
        this.handleClickRoom = this.handleClickRoom.bind(this);
        this.openImageView = this.openImageView.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.pusher = new Pusher(process.env.PUSHER_PUB_KEY, {
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true
        });
    }

    componentDidMount() {
        this.msgScrollRef.scrollTop = this.msgScrollRef.scrollHeight;
        this.subscribeRoom(this.props.room);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.messages !== prevProps.messages){
            // this.msgScrollRef.scrollTop = this.msgScrollRef.scrollHeight;
            const oldScrollHeight = this.msgScrollRef.scrollHeight;
            this.setState({
                messages: this.props.messages
            },() => {
                this.msgScrollRef.scrollTop = this.msgScrollRef.scrollHeight - oldScrollHeight;
            })
        }

        if(this.props.location !== prevProps.location) {
            const urlParams = new URLSearchParams(window.location.search);
            const roomId = urlParams.get('roomId');
            if(roomId){
                const room = this.props.rooms.find(el=>el.id == roomId);
                this.subscribeRoom(room);
                this.setState({
                    selected_room: room,
                });
            }else {
                this.setState({
                    selected_room: null,
                });
            }
        }
    }

    componentWillUnmount() {
        let {channelName} = this.state;
        if(channelName && channelName.length > 0)
            this.pusher.unsubscribe(channelName);
    }

    selectUser(opt) {
        this.setState({
            sel_user: opt
        })
    }

    handleKeyPress(e) {
        if(e.key === 'Enter'){
            this.handleSearch();
        }
    }

    handleNewChatModal () {
        const { onCreateNewChat } = this.props;
        onCreateNewChat();
    }

    handleSearch() {
        const { keyword } = this.state;
        const { onSearchChatRoom } = this.props;
        onSearchChatRoom(keyword);
    }

    handleInputChange(event) {
        const { onSendMedia, onSearchChatRoom } = this.props;
        if(event.target.id === 'message-input'){
            this.setState({
                message: event.target.value
            })
        }else if( event.target.id === 'media-attach'){
            const mediaFile = event.target.files[0];
            onSendMedia(mediaFile);
        }else if(event.target.id === 'search_chat_room'){
            this.setState({
                keyword: event.target.value
            });
            onSearchChatRoom(event.target.value);
        }else if(event.target.id === 'new_message_input') {
            this.setState({
                new_message: event.target.value
            })
        }
    }

    openImageView(file){
        this.setState({
            isOpenImage: true,
            image: file
        })
    }

    loadOldMessages = () => {
        const { selected_room } = this.state;
        const { onLoadMoreMessages } = this.props;

        if (!selected_room) {
            const queryString = window.location.search;
            const parameters = new URLSearchParams(queryString);
            const value = parameters.get('roomId');

            if (value) {
                const room = this.props.rooms.find(el=>el.id == value);
                this.subscribeRoom(room);
                this.setState({
                    selected_room: room,
                });
                onLoadMoreMessages(value);
            }
        } else {
            onLoadMoreMessages(selected_room.id);
        }
    };

    loadMoreUsers = () => {
        const { onLoadMore, lastValue } = this.props;
        const { keyword } = this.state;
        if(lastValue){
            onLoadMore(keyword, lastValue);
        }
    };

    processSpecialContent = (content) => {
        let phonenumber = [];
        let email = [];
        const phonearray = content.match(/\d+/g) || [];
        const regEmail = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        const emailarray = content.split(' ');

        for (let i = 0; i < phonearray.length; i++) {
            if (phonearray[i].match(/\d/g).length === 10) phonenumber.push(phonearray[i]);
        }

        for (let i = 0; i < emailarray.length; i++) {
            if (regEmail.test(emailarray[i])) email.push(emailarray[i]);
        }

        phonenumber.filter((v, i, a) => a.indexOf(v) === i).forEach(el => {
            let reg = new RegExp(el, "g");
            content = content.replace(reg, `<a href="tel:${el}" class="call-link">${el}</a>`);
        });

        email.filter((v, i, a) => a.indexOf(v) === i).forEach(el => {
            let reg = new RegExp(el, "g");
            content = content.replace(reg, `<a href="mailto:${el}" class="call-link">${el}</a>`);
        });

        return parse(content);
    };

    renderMessages() {
        const { user } = this.props;
        const { messages } = this.state;
        TimeAgo.addLocale(en);

        const timeAgo = new TimeAgo('en-US');
        let currentTime = new Date();

        let messages_list = [];
        for (var i = messages.length - 1; i >= 0; i--) {

            if ((i != messages.length - 1) && (messages[i].id === messages[i+1].id)) {
                continue;
            }

            const createdAt = new Date(messages[i].createdAt);
            const diffTime = Math.abs(createdAt.getTime() - currentTime.getTime());
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if(diffDays > 0){
                currentTime = createdAt;
                messages_list.push(
                    <div className="day-separator">
                        {moment(messages[i].createdAt).format('MMMM DD, YYYY')}
                    </div>
                )
            }
            if(messages[i].user_id === user.id){
                if(messages[i].media_file){
                    const medai_file = messages[i].media_file;
                    messages_list.push (
                        <div className="message my-msg" key={messages[i].id} onClick={() => this.openImageView(medai_file)}>
                            <div className="message-content">
                                <img className="message-media" src={medai_file}></img>
                            </div>
                            <div className="message-time">{moment(messages[i].createdAt).format("HH:MM")}</div>
                        </div>
                    )
                }else if(messages[i].content) {
                    messages_list.push (
                        <div className="message my-msg" key={messages[i].id}>
                            <div className="message-content">
                                {this.processSpecialContent(messages[i].content)}
                            </div>
                            <div className="message-time">{moment(messages[i].createdAt).format("HH:MM")}</div>
                        </div>
                    )
                }
            }else{
                if(messages[i].media_file){
                    messages_list.push(
                        <div className="message" key={messages[i].id} onClick={() => this.openImageView(messages[i].media_file)}>
                            <div className="message-content">
                                <img src={messages[i].media_file}></img>
                            </div>
                            <div className="message-time">{moment(messages[i].createdAt).format("HH:MM")}</div>
                        </div>
                    )
                }else if(messages[i].content) {
                    messages_list.push (
                        <div className="message" key={messages[i].id}>
                            <div className="message-content">
                                {this.processSpecialContent(messages[i].content)}
                            </div>
                            <div className="message-time">{moment(messages[i].createdAt).format("HH:MM")}</div>
                        </div>
                    )
                }
            }
        }

        return (
            <div className="messages-inner content">
                {messages_list.reverse()}
            </div>
        )
    }

    subscribeRoom = (room) => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('roomId');

        if (!room && roomId) {
            room = this.props.rooms.find(el=>el.id == roomId);
        } else if (!room && !roomId) {
            room = this.props.rooms[0];
        }

        if(room) {
            let {channelName} = this.state;
            if(channelName !== null && channelName.length > 0)
                this.pusher.unsubscribe(channelName);
            channelName = room.chat_type + "-" + room.level + "-" + room.id;
            this.setState({channelName});
            const channel = this.pusher.subscribe(channelName);

            channel.bind('message', this.updateEvents);
        }
    }

    handleClick = () => {
        this.fileInput.click();
    };

    handleSendMessage = (message) => {
        const { onSendMessage } = this.props;
        this.setState({
            message: ''
        });
        this.subscribeRoom(this.state.selected_room);
        onSendMessage(message);
    }

    handleClickRoom = (room) => {
        const { onClickRoom } = this.props;

        const {title, avatar, group_avatar} = this.getChatProfile(room);

        this.setState({
            title: title,
            avatar: avatar,
            group_avatar,
            selected_room: room
        });
        this.subscribeRoom(room);

        onClickRoom(room);
    }

    updateEvents = (data) => {
        let {messages} = this.state;
        messages.push(data);
        this.setState({messages}, () => this.msgScrollRef.scrollTop = this.msgScrollRef.scrollHeight);
    }

    getChatProfile(room) {
        let avatar = null, group_avatar = null, title = null;

        if(room.chat_type === 'direct' && room.level === 'admin'){
            title = 'Admin';
            group_avatar = 'ADMIN';
        }

        if(room.chat_type === 'direct' && room.level === 'user'){
            const user = room.users.find(el => el.id !== room.owner_id)
            title = room.title?room.title:user.first_name + ', ' + user.last_name;
            avatar = user.avatar;
        }

        if(room.chat_type === 'group' && room.level === 'admin'){
            const group_info = this.getGroupChatRoomInfo(room.users);
            title = room.title?room.title:group_info.title;
            group_avatar = group_info.avatar;
        }

        if(room.chat_type === 'group' && room.level === 'user'){
            const group_info = this.getGroupChatRoomInfo(room.users);
            title = room.title?room.title:group_info.title;
            group_avatar = group_info.avatar;
        }

        if(room.chat_type === 'job' && (room.level === 'admin' || room.level === 'user')){
            title = room.title?room.title:(room.job?room.job.title:'');
            avatar = (room.job&&room.job.avatar)?room.job.avatar:'/static/images/group_avatar.png';
        }

        return {title, avatar, group_avatar};
    }

    getGroupChatRoomInfo(group_arr) {
        let title = '';
        if(group_arr.length > 1)
            title = group_arr[0].first_name + " " + group_arr[0].last_name + " and " + (group_arr.length - 1) + "members";
        else
            title = group_arr[0].first_name + " " + group_arr[0].last_name;

        let avatar = '';
        for(let id = 0; id < group_arr.length; id += 1){
            avatar += group_arr[id].first_name.charAt(0).toUpperCase();
        }
        return {title, avatar};
    }

    static arrowRenderer() {
        return <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" />
    }

    render() {
        const { room, rooms } = this.props;
        const { message, keyword, selected_room, authUser } = this.state;
        return (
            <div className="card message-card">
                <div className="card-body">
                    <div className={"left-wrapper" + (selected_room?' selected':'')}>
                        <div className="header">
                            <div className="input-group search-user-room">
                                <div className="input-group-prepend">
                                    <img src="/static/images/icons/icon-search.svg" alt="" />
                                </div>
                                <DelayInput minLength={0} delayTimeout={1000} type="text" className="form-control search-input-user" placeholder="Search ..." value={keyword} id="search_chat_room" onChange={this.handleInputChange}/>
                            </div>
                            <div className="input-group-append" onClick={this.handleNewChatModal}>
                                <img src="/static/images/icons/icon-add.svg" alt="" />
                            </div>
                        </div>
                        <div className="body">
                            <PerfectScrollbar
                                ref={(ref) => {this.userScrollBarRef = ref;}}
                                options={{
                                    suppressScrollX: true
                                }}
                            >   {!rooms||rooms.length === 0?"No Rooms":
                                <InfiniteScroll
                                    pageStart={0}
                                    loadMore={this.loadMoreUsers}
                                    hasMore={true||false}
                                    useWindow={false}
                                >
                                    <div className="user-list">
                                        {rooms.map((myRoom) => {
                                            return (
                                                <UserCell
                                                    key={myRoom.id}
                                                    room={myRoom}
                                                    authUser={authUser}
                                                    seleted={room?(myRoom.id==room.id):false}
                                                    onClick={() => this.handleClickRoom(myRoom)}
                                                />
                                            )
                                        })}
                                    </div>
                                </InfiniteScroll>}

                            </PerfectScrollbar>
                        </div>
                    </div>
                    <div className={"right-wrapper" + (room?' selected':'')}>
                        <div className="body">
                        {this.state.isOpenImage?
                        <Lightbox
                            medium={this.state.image}
                            onClose={() => this.setState({ isOpenImage: false })}
                        />:null}
                            <div className="messages">
                                <PerfectScrollbar
                                    containerRef={ref => this.msgScrollRef = ref}
                                    onYReachStart={this.loadOldMessages}
                                    options={{
                                        suppressScrollX: true
                                    }}
                                    component="div"
                                >
                                    {this.renderMessages()}
                                </PerfectScrollbar>
                            </div>
                            <form className="message-form">
                                <div className="action" onClick={this.handleClick}>
                                    <img src="/static/images/icons/icon-new.svg" alt="" />
                                    <input type="file" className="d-none" accept="image/x-png,image/jpg,image/jpeg" id="media-attach" ref={ref => this.fileInput = ref} onChange={this.handleInputChange}/>
                                </div>
                                <div className="text">
                                    <textarea name="text" className="form-control auto-expand" data-min-rows="1" data-max-rows="5" rows="1" value={message} id="message-input" onChange={this.handleInputChange} />
                                </div>
                                <div className="action" onClick={() => this.handleSendMessage(message)}>
                                    <img src="/static/images/icons/icon-play.svg" alt="" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

MessageCard.propTypes = {
    rooms: PropTypes.array,
    messages: PropTypes.array,
    onClickRoom: PropTypes.func,
    onSendMessage: PropTypes.func,
    onSearchChatRoom: PropTypes.func,
    onSendMedia: PropTypes.func,
    onCreateNewChat: PropTypes.func,
    onLoadMore: PropTypes.func,
    onLoadMoreMessages: PropTypes.func,
    lastValue: PropTypes.number,
    user: PropTypes.object,
    loadingRooms: PropTypes.bool,
    room: PropTypes.object,
    users: PropTypes.array
};

export default MessageCard;
