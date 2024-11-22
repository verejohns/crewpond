import React, { Component } from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { withRouter } from 'react-router-dom';
import { MessageCard } from '../../../../components'
import selectors from './selectors';
import actions from '../../../actions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ADMIN_ACCOUNT } from '../../../../../../utils/constant';

class Chat extends Component {
    constructor() {
      super();
      this.state = {
        orderBy: 'createdAt',
        limit: 10,
        lastValue: null,
        keyword: null,
        rooms: [],
        messages: [],
        currentRoom: null,
        admin: null,
        users: []
      }
      this.handleChatRoom = this.handleChatRoom.bind(this);
      this.handleSendMessage = this.handleSendMessage.bind(this);
      this.handleSendMedia = this.handleSendMedia.bind(this);
      this.handleLoadMore = this.handleLoadMore.bind(this);
      this.handleSearchJobber = this.handleSearchJobber.bind(this);
      this.handleCreateRoom = this.handleCreateRoom.bind(this);
      this.handleSearchRoom = this.handleSearchRoom.bind(this);
    }

    componentDidMount() {
      const { getChatList, match: {params: {id}} } = this.props;
      const { limit, orderBy, lastValue, keyword } = this.state;
      const admin = JSON.parse(localStorage.getItem(ADMIN_ACCOUNT));
      this.setState({
        admin: admin
      })
      getChatList({limit, orderBy, lastValue, keyword})
      .then(({result: {data}}) => {
        this.setState({
          rooms: data.rooms
        })
      })
    }

    handleChatRoom(room) {
      const { getMessageHistory } = this.props;
      this.setState({
        currentRoom: room
      })
      getMessageHistory({room_id: room.id, limit: 10})
      .then(({result: {data}}) => {
        this.setState({
          messages: data.messages.reverse()
        })
      })
    }

    handleSendMessage(message) {
      const { sendMessage } = this.props;
      const { currentRoom } = this.state;
      if(currentRoom){
        sendMessage({room_id: currentRoom.id, text: message});
      }
    }

    handleSendMedia(file) {
      const { attachMedia } = this.props;
      const { currentRoom } = this.state;
      if(currentRoom) {
        attachMedia({room_id: currentRoom.id, file: file});
      }
    }

    componentWillReceiveProps(nextProps) {
      if(JSON.stringify(this.props.message) !== JSON.stringify(nextProps.message)){
        const { message } = nextProps.message
        let { messages } = this.state;
        messages.push(message);

        this.setState({
          messages: messages
        })
      }
    }

    handleLoadMore(keyword, lastValue) {
      const { getChatList } = this.props;
      const { limit, orderBy } = this.state;
      let { rooms } = this.state;
      getChatList({limit, orderBy, lastValue, keyword})
      .then(({result: {data}}) => {
        this.setState({
            rooms: rooms.concat(data.rooms),
            lastValue: data.lastValue
        })
      })
    }

    handleSearchJobber(keyword) {
      const { getUsers } = this.props;
      getUsers({offset: 1, orderBy: 'createdAt', limit: 10, keyword: keyword})
      .then(({result: {data}}) => {
        if(data.result === 'success') {
          let users = [];
          for(let i = 0; i < data.users.length; i += 1){
            const option = {label: data.users[i].first_name + ', ' + data.users[i].last_name, value: data.users[i]};
            users.push(option);
          }
          this.setState({
            users: users
          })
        }else{
          this.setState({
            users: []
          })
        }
      });
    }

    handleCreateRoom(user, message){
      const { createChat, getChatList, match: {params: {id}} } = this.props;
      const { limit, orderBy, lastValue, keyword } = this.state;
      const user_ids = [0, user.id];
      const type = "direct";

      createChat({user_ids, title:null, type, message})
      .then(({result: {data}}) => {
        getChatList({limit, orderBy, lastValue, keyword})
        .then(({result: {data}}) => {
          this.setState({
            lastValue: data.lastValue,
            rooms: data.rooms
          })
        })
        this.handleChatRoom(data.room);
      }).catch(() => {
        toast.error("Failed to create chat room");
      });
    }

    handleSearchRoom(keyword) {
      const { getChatList } = this.props;
      const { limit, orderBy } = this.state;
      getChatList({limit, orderBy, keyword})
      .then(({result: {data}}) => {
        this.setState({
            rooms: data.rooms
        })
      })
    }

    render() {
      const { rooms, messages, admin, currentRoom, users, lastValue } = this.state;
      return (
      <div className="animated fadeIn">
        <MessageCard rooms={rooms} messages={messages} room={currentRoom} onLoadMore={this.handleLoadMore} onSearchJobber={this.handleSearchJobber}
                    users={users} lastValue={lastValue} onCreateNewChat={this.handleCreateRoom} onClickRoom={this.handleChatRoom} onSendMessage={this.handleSendMessage}
                    onSendMedia={this.handleSendMedia} user={admin} onSearchChatRoom={this.handleSearchRoom}/>
      </div>

      );
    }
}

Chat.propTypes = {
  getChatList: PropTypes.func.isRequired,
  getMessageHistory: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
  attachMedia: PropTypes.func.isRequired,
  message: PropTypes.object,
  getUser: PropTypes.func.isRequired,
  getUsers: PropTypes.func.isRequired,
  createChat: PropTypes.func.isRequired,
};


export default connect(
  selectors,
  {
    ...actions.chat,
    ...actions.users
  },
)(withRouter(Chat));

