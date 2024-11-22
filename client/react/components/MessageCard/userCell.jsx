import React, { Component } from "react";
import PropTypes from "prop-types";
import { LOGGED_ACCOUNT, ADMIN_ACCOUNT } from '../../../../utils/constant';
import cn from 'classnames';
import moment from 'moment';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

class UserCell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            avatar: null,
            title: '',
            last_message: '',
            last_time: null,
            chatType: 'direct'
        };
    }

    componentWillMount() {
        const { room, authUser } = this.props;
        
        const admin = JSON.parse(localStorage.getItem(ADMIN_ACCOUNT));

        const chat_profile = this.getChatProfile(room, authUser, admin);

        this.setState({
            title: chat_profile.title,
            avatar: chat_profile.avatar,
            last_message: chat_profile.last_message,
            admin: admin,
        });
    }

    getChatProfile(room, user, admin) {
        let avatar = null, title = null, last_message = '', last_time = null;

        if(room.chat_type === 'direct' && room.level === 'admin'){
            if(user){
                title = 'Admin';
                avatar = '/static/images/avatar.png';
            }else{
                title = room.title;
                avatar = room.users[0].avatar?room.users[0].avatar:null;
            }
            this.setState({chatType: 'direct'});
        }

        if(room.chat_type === 'direct' && room.level === 'user'){
            const oppUser = room.users.find(el => el.id !== user.id);
            if(oppUser){
                title = room.title?room.title:oppUser.first_name + ' ' + oppUser.last_name;
                avatar = oppUser.avatar;
            }else{
                title = user.first_name + ' ' + user.last_name;
                avatar = user.avatar;
            }
            
            this.setState({chatType: 'direct'})
        }

        if(room.chat_type === 'group' && (room.level === 'admin' || room.level === 'user')){
            title = room.title?room.title:this.getGroupChatRoomInfo(room.users);
            avatar = '/static/images/group_avatar.png';
            this.setState({chatType: 'group'})
        }

        if(room.chat_type === 'job' && (room.level === 'admin' || room.level === 'user')){
            title = room.title?room.title:(room.job?room.job.title:'');
            avatar = (room.job&&room.job.avatar)?room.job.avatar:'/static/images/group_avatar.png';
            this.setState({chatType: 'job'})
        }
        
        return {title, avatar, last_message: room.last_message, last_time};
    }

    getGroupChatRoomInfo(group_arr) {
        let title = '';
        if(group_arr.length > 1)
            title = group_arr[0].first_name + " " + group_arr[0].last_name + " and " + (group_arr.length - 1) + "members";
        else
            title = group_arr[0].first_name + " " + group_arr[0].last_name;
        
        return title;
    }

    render() {
        const { onClick, room, seleted } = this.props;
        let {title, avatar, last_message, chatType} = this.state;
        const active = seleted;
        TimeAgo.addLocale(en)
        const timeAgo = new TimeAgo('en-US');
        let noborder = false;
        if(chatType === 'job' || chatType === 'group') {
            avatar = avatar?avatar:'/static/images/group_avatar.png';
            noborder = avatar?false:true;
        }

        if(chatType === 'direct') {
            avatar = avatar&&avatar.length>0?avatar:'/static/images/avatar.png';
            noborder = !avatar?false:true;
        }

        const last_message_content = (last_message && last_message.content)?last_message.content:'';

        return (
            <div className={cn('user-row', { active })} onClick={() => onClick(room)}>
                <div className={`avatar${noborder?' no-border':''}`}>
                    <img src={avatar} alt="" />
                </div>
                <div className="info">
                    <div className="username">{title}</div>
                    <div className="last_from">{}</div>
                    <div className="last-message">{last_message_content.length > 10 ? last_message_content.substring(0, 10) + "...":last_message_content}</div>
                </div>
                <div className="action">
                    <div className="time-ago">
                        {(last_message&&last_message.createdAt)?timeAgo.format(moment(last_message.createdAt).toDate()):timeAgo.format(moment(room.createdAt).toDate())}
                    </div>
                    {room.unread_count > 0?<div className="badge-count">{room.unread_count}</div>:null}
                </div>
            </div>
        );
    }
}

UserCell.propTypes = {
    room: PropTypes.object,
    seleted: PropTypes.bool,
    onClick: PropTypes.func
};

export default UserCell;
