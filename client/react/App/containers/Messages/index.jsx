import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from 'react-redux/es/connect/connect';
import selectors from './selectors';
import actions from '../../actions';
import { LOGGED_ACCOUNT } from '../../../../../utils/constant';
import { withRouter } from 'react-router-dom';
import { paths, messages } from '../../../../../utils';

import { toast } from "react-toastify";
import { MessageCard, PageHeader, UserDetailCard } from "../../components";
import { NewChat } from "../../components";

class Messages extends Component {
  constructor(props) {
    super(props);

    // Set Initial State
    this.state = {
      orderBy: 'updatedAt',
      limit: 10,
      lastValue: null,
      rooms: [],
      messages: [],
      user: null,
      currentRoom: null,
      participantDetail: null,
      users: [],
      archive: false,
      isLoading: true,
      isOpen: false
    };
    this.authUser = JSON.parse(localStorage.getItem(LOGGED_ACCOUNT));
    this.lastMessageValue = null;
    this.isLoadingChatHistory = false

    this.handleChatRoom = this.handleChatRoom.bind(this);
    this.handleSendMedia = this.handleSendMedia.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleSearchRoom = this.handleSearchRoom.bind(this);
    this.handleSearchJobber = this.handleSearchJobber.bind(this);
    this.handleCreateRoom = this.handleCreateRoom.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

    componentDidMount() {
      this.initChatPage();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
      if (this.props.location !== prevProps.location) {
        this.initChatPage();
      } else if(this.props.badgeCount !== prevProps.badgeCount) {
        this.initChatPage();
      }
    }

    initChatPage = () => {
      const { rooms } = this.state;
      const urlParams = new URLSearchParams(window.location.search);
      let roomId = urlParams.get('roomId');
      const archive = urlParams.get('archive') === 'true';

      if (!roomId && rooms && rooms.length > 0) {
        roomId = rooms[0].id;
      }
      
      this.loadChatList(null, null, roomId, archive);
    }

    loadChatList = (keyword, lastValue, roomId, archive) => {
      const { getChatList, getArchivedChatList } = this.props;
      const { limit, orderBy } = this.state;
      let { rooms } = this.state;
      this.setState({isLoading: true})
      if(archive === true) {
        getArchivedChatList({limit, orderBy, lastValue, keyword, roomId})
        .then(({result: {data}}) => {
          let currentRoom = null
          if(roomId){
            currentRoom = data.rooms.find(el=>el.id == roomId);
            if(currentRoom) {
              this.handleSelectRoom(currentRoom);
            }
          }

          this.setState({
            lastValue: data.lastValue,
            rooms: data.rooms, currentRoom,
            isLoading: false,
            archive: true
          })
        })
      }else {
        getChatList({limit, orderBy, lastValue, keyword, roomId})
        .then(({result: {data}}) => {
          let currentRoom = null;
          if(roomId){
            currentRoom = data.rooms.find(el=>el.id == roomId);
            if(currentRoom) {
              this.handleSelectRoom(currentRoom);
            }
          }
          this.setState({
            lastValue: data.lastValue,
            rooms: data.rooms, currentRoom,
            isLoading: false,
            archive: false
          })
        })
      }
    }

    validateRoom(title, user_ids) {
      if(title === '') {
          toast.error(messages.CHAT_ROOM_NAME_REQUIRED);
          return false;
      }
      if(user_ids.length === 0) {
          toast.error(messages.CHAT_USERS_REQUIRED);
          return false;
      }
      return true;
    }

    handleCreateRoom(chat_name, jobbers, favorites, isGroupChat){
      const {createChat, id, history: { push }, getIsArchivedRoom } = this.props;
        let selectedJobbers = [];
        if(jobbers){
            selectedJobbers = selectedJobbers.concat(jobbers.filter(function (el) {
                if(el.is_selected)
                    return true;
                else
                    return false;
            }));
        }
        if(favorites) {
            selectedJobbers = selectedJobbers.concat(favorites.filter(function (el) {
                if(el.is_selected)
                    return true;
                else
                    return false;
            }));
        }

        let user_ids = [this.authUser.id];
        for(let i = 0; i < selectedJobbers.length; i += 1){
            user_ids.push(selectedJobbers[i].id);
        }

        if(this.validateRoom(chat_name, user_ids)) {
            createChat({user_ids, title: null, job_id: id, type: isGroupChat?"group":"job"})
            .then(({result: {data}}) => {
                const {room} = data;
                push(`${paths.client.APP_MESSAGES}?roomId=${room.id}`);
            }).catch((error) => {
                console.error(error);
                toast.error(messages.INTERNAL_SERVER_ERROR);
            })
            this.setState({
                isOpen: false
            });
        }
    }

    handleChatRoom(room) {
      this.setState({
        currentRoom: room
      });
      if(room){
        this.loadMessageHistory(room.id)
        this.getParticipantsInfo(room);

      }
    }

    loadMessageHistory = (room_id) => {
      const { getMessageHistory } = this.props;
      this.isLoadingChatHistory = true;
      getMessageHistory({room_id, limit: 10})
      .then(({result: {data}}) => {
        this.setState({
          messages: data.messages.reverse()
        });
        this.isLoadingChatHistory = false;
        this.lastMessageValue = data.lastValue
      });
    }

    loadMoreMessageHistory = (room_id) => {
      const { getMessageHistory } = this.props;
      if(this.lastMessageValue && !this.isLoadingChatHistory){
        this.isLoadingChatHistory = true
        getMessageHistory({room_id, limit: 10, lastValue: this.lastMessageValue})
        .then(({result: {data}}) => {
          let { messages } = this.state;
          this.setState({
            messages: data.messages.reverse().concat(messages),
          });
          this.isLoadingChatHistory = false;
          this.lastMessageValue = data.lastValue
        });
      }
    }

    handleSelectRoom = (room) => {
      const { getRoomById } = this.props;
      if(room){
        getRoomById(room.id)
        .then(({result: {data}}) => {
          this.handleChatRoom(data.room);
        });
      }
    }

    handleSearchJobber(keyword){
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

    getParticipantsInfo(room) {
      const { getUser } = this.props;
      let title = '', chatType = '', avatar = '', createdAt = '', opp_user = null;
      const id = room.id;
      chatType = room.chat_type;
      createdAt = room.createdAt;
      if(room.level === 'admin' && (room.chat_type === 'direct' || room.chat_type === 'group')) {
        title = room.title?room.title:"Admin";
        avatar = '/static/images/avatar.png';
        this.setState({
          participantDetail: {id, title, chatType, avatar, createdAt, users: room.users}
        });
      }else if(room.level === 'user' && room.chat_type === 'direct') {
        opp_user = room.users.find(el=>el.id != this.authUser.id);
        getUser(opp_user.id)
        .then(({result: {data}}) => {
          let participantDetail = data.user;
          participantDetail.chatType = chatType;
          this.setState({participantDetail});
        });
      }else if(room.level === 'user' && room.chat_type === 'group') {
        const other_users = room.users.filter(el=>el.id !== this.authUser.id);
        title = room.title?room.title:(other_users.length > 0?(other_users[0].first_name + " " +other_users[0].last_name + " And " + (other_users.length-1)):"Group Chat");
        avatar = '/static/images/group_avatar.png';
        this.setState({
          participantDetail: {id, title, chatType, avatar, createdAt, users: room.users}
        });
      }else if(room.level === 'user' && room.chat_type === 'job') {
        avatar = room.job.avatar;
        title = room.title?room.title:room.job.title;
        this.setState({
          participantDetail: {id, title, chatType, avatar, createdAt, users: room.users, job: room.job}
        })
      }
    }

    handleSendMessage(message) {
        const { sendMessage } = this.props;
        const { currentRoom } = this.state;
        if(currentRoom){
          sendMessage({room_id: currentRoom.id, text: message}).then(() => {
            this.loadMessageHistory(currentRoom.id);
          });
          
        }
        
    }

    handleLoadMore(keyword, lastValue) {
      const { archive, limit, orderBy } = this.state;
      const { getChatList, getArchivedChatList } = this.props;
      let { rooms } = this.state;
      // this.setState({isLoading: true})
      if(archive === true) {
        getArchivedChatList({limit, orderBy, lastValue, keyword})
        .then(({result: {data}}) => {
          this.setState({
            lastValue: data.lastValue,
            rooms: rooms.concat(data.rooms),
            // isLoading: false
          })
        })
      }else {
        getChatList({limit, orderBy, lastValue, keyword})
        .then(({result: {data}}) => {
          this.setState({
            lastValue: data.lastValue,
            rooms: rooms.concat(data.rooms),
            // isLoading: false
          })
        })
      }
    }

    handleSearchRoom(keyword) {
      this.setState({ rooms: [] }, () => {
        this.handleLoadMore(keyword, null);
      });
    }

    handleSendMedia(file) {
        const { attachMedia } = this.props;
        const { currentRoom } = this.state;
        if(currentRoom) {
            attachMedia({room_id: currentRoom.id, file: file});
        }
    }

    handleSubmitArchive = (room_id) => {
      const { history: {push} } = this.props;
      const { currentRoom, rooms } = this.state;
      const updatedRoomsList = rooms.filter(el=>el.id !== room_id)
      if(currentRoom.id === room_id && updatedRoomsList.length > 0) {
        this.handleChatRoom(updatedRoomsList[0])
      } else {
        this.setState({
          participantDetail: null
        })
      }
      this.setState({
        rooms: updatedRoomsList,
        messages: []
      });
      push(paths.client.APP_MESSAGES);
    }

    handleGotoRoom = (room) => {
      const { history: {push}, getIsArchivedRoom } = this.props;
      getIsArchivedRoom({roomId: room.id})
      .then(({result: {data}}) => {
          const { isArchived } = data;
          const archivedQuery = isArchived?'&archive=true':'';
          push(`${paths.client.APP_MESSAGES}?roomId=${room.id + archivedQuery}`);
      }).catch((error) => {
          console.log(error)
          toast.error(messages.CHAT_ROOM_FAILED);
      })
    }

    handleClose =() => {
      this.setState({isOpen: false})
    }

    render() {
        const { rooms, messages, currentRoom, participantDetail, lastValue, users, archive, isLoading, isOpen } = this.state;
        const { history, location } = this.props;
        return (
            <React.Fragment>
                {archive === true?<PageHeader type="archive" />:null}
                <NewChat isOpen={isOpen} handleCreateRoom={this.handleCreateRoom} history={history} isGroupChat={true}
                                gotoChatRoom={this.handleGotoRoom} handleClose={() => this.handleClose()}/>
                <div className="page-content">
                    <div className="container-fluid message-container">
                        <div className="row">
                            <div className="col-lg-9 mb-5 mb-lg-0">
                                <MessageCard location={location} rooms={rooms} messages={messages} room={currentRoom} onLoadMore={this.handleLoadMore} onLoadMoreMessages={this.loadMoreMessageHistory} loadingRooms={isLoading}
                                  users={users} lastValue={lastValue} onClickRoom={this.handleGotoRoom} onSendMessage={this.handleSendMessage} onCreateNewChat={() => this.setState({isOpen: true})}
                                  onSendMedia={this.handleSendMedia} onSearchChatRoom={this.handleSearchRoom} user={this.authUser}/>
                            </div>
                            <div className="col-lg-3">
                              <UserDetailCard data={participantDetail} isEdit={true} history={history} onSubmitAdd={this.handleGotoRoom} onSubmitArchive={this.handleSubmitArchive} room={currentRoom} isArchived={archive} />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

Messages.propTypes = {
    getChatList: PropTypes.func.isRequired,
    getArchivedChatList: PropTypes.func.isRequired,
    getMessageHistory: PropTypes.func.isRequired,
    isLoadingChatHistory: PropTypes.bool,
    getUser: PropTypes.func.isRequired,
    getUsers: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    attachMedia: PropTypes.func.isRequired,
    createChat: PropTypes.func.isRequired,
    getRoomById: PropTypes.func.isRequired,
    message: PropTypes.object,
    badgeCount: PropTypes.object,
    match: PropTypes.shape({
      params: PropTypes.string
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired
  };

  export default connect(
    selectors,
    {
      ...actions.chats,
      ...actions.users,
      ...actions.settings
    },
  )(withRouter(Messages));
