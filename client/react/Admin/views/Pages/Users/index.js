import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import connect from 'react-redux/es/connect/connect';
import {toast} from "react-toastify";
import moment from 'moment';
import PropTypes from 'prop-types';

import { TableView, TableActions } from '../../../components';
import { Score } from '../../../../components';
import { Badge, Modal, ModalBody } from 'reactstrap';
import selectors from './selectors';
import actions from '../../../actions';
import { paths, messages } from '../../../../../../utils';

class Users extends Component {
    constructor() {
      super();

      this.state = {
        is_send_email: false,
        columns: [
          'select',
          'UserName',
          'Email',
          'Company',
          'Reviews',
          'Status',
          'Actions'
        ],
        selectedUsers: [],
        unselectedUsers: [],
        users: [],
        total: 1,
        offset: 1,
        defaultLimit: 10,
        loading: false,
        selectAll: false,
        show_modal: false,
        send_subject: '',
        send_content: '',
        actions: [{id: 'action-delete', label: "Delete"},
                  {id: 'action-edit', label: "Edit"},
                  {id: 'action-hide', label: "Hide"},
                  {id: 'action-show', label: "Show"},
                  {id: 'action-suspend', label: "Suspend"},
                  {id: 'action-resume', label: "Resume"},
                  {id: 'action-chat', label: "Chat"},
                  {id: 'action-verify', label: "Verify"}]
      }

      this.handleRecordSearch = this.handleRecordSearch.bind(this);
      this.handleSelectAll = this.handleSelectAll.bind(this);
      this.handleSelectItem = this.handleSelectItem.bind(this);
      this.onPagination = this.onPagination.bind(this);
      this.handleAction = this.handleAction.bind(this);
      this.suspendAccount = this.suspendAccount.bind(this);
      this.hideAccount = this.hideAccount.bind(this);
      this.handleSendMessage = this.handleSendMessage.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.showModal = this.showModal.bind(this);
    }

    componentDidMount() {
      const { getUsers } = this.props;
      const { defaultLimit, offset } = this.state;
      this.setState({
        loading: true
      })
      getUsers({offset, orderBy: 'createdAt', limit: defaultLimit, keyword: ''})
      .then(({result: {data}}) => {
        this.setState({
          users:data.users,
          total: data.total,
          loading: false
        });
      })
      .catch(({ response: { data } }) => {
        this.showToast(false, data.msg);
        this.setState({
          loading: false
        })
      });
    }

    showToast(type, message) {
      if(type) {
        toast.success(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      }else {
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      }
    }

    handleInputChange({target: {id, value}}){
      this.setState({
        [id]: value
      })
    }

    handleSendMessage(event) {
      if (event) {
        event.preventDefault();
      }
      const {is_send_email, send_subject, send_content, selectedUsers, unselectedUsers, selectAll} = this.state;
      const {sendEmail, sendNotification} = this.props;

      if(send_subject.length === 0) {
        this.showToast(false, "Please input the subject");
        toast.error();
        return;
      }
      if(send_content.length === 0) {
        this.showToast(false, "Please input the content");
        return;
      }

      if(is_send_email) {
        if(selectAll)
          sendEmail({subject: send_subject, content: send_content, users: unselectedUsers, all: selectAll})
          .then(({result: {data}}) => {
            this.showToast(true, data.message);
          }).catch(({response: {data}}) => {
            this.showToast(false, data.message);
          });
        else
          sendEmail({subject: send_subject, content: send_content, users: selectedUsers, all: selectAll})
          .then(({result: {data}}) => {
            this.showToast(true, data.message);
          }).catch(({response: {data}}) => {
            this.showToast(false, data.message);
          });
      }else{
        if(selectAll)
          sendNotification({subject: send_subject, content: send_content, users: unselectedUsers, all: selectAll})
          .then(() => {
            this.showToast(true, "Sent notification to users");
          }).catch(() => {
            this.showToast(false, "Ineternal Server Error");
          });
        else{
          sendNotification({subject: send_subject, content: send_content, users: selectedUsers, all: selectAll})
          .then(() => {
            this.showToast(true, "Sent notification to users");
          }).catch(() => {
            this.showToast(false, "Internal Server Error");
          });
        }
      }
      this.setState({show_modal: false});
    }

    handleSelectItem(user) {
      let {selectAll, selectedUsers, unselectedUsers} = this.state;
      if(selectAll) {
        if(!unselectedUsers.find(el=>el.id == user.id)) {
          unselectedUsers.push(user);
        }else{
          unselectedUsers = unselectedUsers.filter(el=>el.id != user.id)
        }

        this.setState({
          unselectedUsers
        })
      }else{
        if(selectedUsers.find(el=>el.id == user.id)) {
          selectedUsers = selectedUsers.filter(el=>el.id != user.id)
        }else{
          selectedUsers.push(user)
        }
        this.setState({
          selectedUsers
        })
      }
    }

    handleAction(id, user) {
      const { deleteUser, history: { push }, createChat } = this.props;
      const user_id = user.id
      if(id === 'action-delete'){
        deleteUser(user_id)
        .then(({result: {data}}) => {
          this.setState(prevState => ({
            users: prevState.users.filter(el=>el.id != user_id)
          }));
          this.showToast(true, data.msg);
        }).catch(({response: {data}}) => {
          this.showToast(false, data.msg);
        });
      }else if(id === 'action-edit') {
        push(paths.build(paths.client.ADMIN_EDIT_USER, user_id));
      }else if(id === 'action-hide') {
        this.hideAccount(user_id, true)
      }else if(id === 'action-show') {
        this.hideAccount(user_id, false)
      }else if(id === 'action-suspend'){
        this.suspendAccount(user_id, true);
      }else if(id === 'action-block'){
      }else if(id === 'action-resume') {
        this.suspendAccount(user_id, false);
      }else if(id === 'action-chat') {
        const user_ids = [user_id];
        const job_id = null;
        const type = 'direct';
        const level = 'admin'
        createChat({user_ids, title:null, job_id, type, level})
        .then(({result: {data}}) => {
          push(paths.client.ADMIN_CHAT);
        }).catch(({response: {data}}) => {
          toast.error(data.msg)
        })
      }else if(id === 'action-verify') {
        this.verifyAccount(user_id)
      }
    }

    verifyAccount(user_id){
      const { updateUser } = this.props;
      const confirmed_at = moment();
      updateUser(user_id,
        {
          confirmed_at: confirmed_at
        }
      ).then(() => {
        let index = this.state.users.findIndex(el=>el.id==user_id);
        let users = [...this.state.users];
        users[index].confirmed_at = confirmed_at;

        this.setState({
          users: users
        });
        this.showToast(true, "Confirmed account");
      }).catch(() => {
        this.showToast(false, "Failed to confirm an account");
      })
    }

    hideAccount(user_id, hide) {
      const { updateUser } = this.props;
      updateUser(user_id,
        {
          is_hided: hide
        }
      ).then(({result: {data}}) => {
        let index = this.state.users.findIndex(el=>el.id==user_id);
        let users = [...this.state.users];
        users[index].is_hided = hide;

        this.setState({
          users: users
        });
        this.showToast(true, data.msg);
      }).catch(({response}) => {
        if(!response) return;
        this.showToast(false, response.data.msg);
      })
    }

    suspendAccount(user_id, suspend){
      const { updateUser } = this.props;
      updateUser(user_id,
        {
          is_suspended: suspend
        }
      ).then(({result: {data}}) => {
        let index = this.state.users.findIndex(el=>el.id==user_id);
        let users = [...this.state.users];
        users[index].is_suspended = suspend;

        this.setState({
          users: users
        });
        this.showToast(true, data.msg);
      }).catch(({response}) => {
        this.showToast(false, response.data.msg);
      })
    }

    onPagination({ offset, orderBy, limit, keyword, location, range, categories }) {
      const { getUsers } = this.props;
      this.setState({
        offset: offset,
        searchStr: keyword,
        loading: true
      });

      getUsers({offset: offset, orderBy, limit, keyword, location, range, categories})
      .then(({result: {data}}) => {
        this.setState({
          users:data.users,
          total: data.total,
          loading: false
        })

      })
      .catch(({ response: { data } }) => {
        this.showToast(false, data.msg);
        this.setState({
          loading: false
        })
      });
    }

    handleSelectAll() {
      this.setState({
        selectAll: !this.state.selectAll
      })
    }

    handleRecordSearch({ orderBy, limit, keyword, location, range, categories }) {
      const { getUsers } = this.props;
      this.setState({
        offset: 1,
        searchStr: keyword,
        loading: true
      });

      getUsers({offset: 1, orderBy, limit, keyword, location, range, categories})
      .then(({result: {data}}) => {
        this.setState({
          users:data.users,
          total: data.total,
          loading: false
        })

      })
      .catch(({ response: { data } }) => {
        this.showToast(false, data.msg);

        this.setState({
          loading: false
        })
      });
    }

    showModal(is_send_email) {
      const {selectAll, selectedUsers, unselectedUsers, total} = this.state;
      if(selectAll){
        if(unselectedUsers.length === total){
          this.showToast(false, 'You didn\'t select any user')
          return;
        }
      }else{
        if(selectedUsers.length === 0){
          this.showToast(false, 'You didn\'t select any user')
          return;
        }
      }
      this.setState({
        show_modal: true,
        is_send_email: is_send_email
      })
    }

    handleForgottenPassword() {
      let {selectAll, selectedUsers, unselectedUsers, users} = this.state;

      if (selectAll) this.sendForgottenPassword(users.filter((user) => !unselectedUsers.find((unselectedUser) => unselectedUser.id === user.id)));
      else this.sendForgottenPassword(selectedUsers);
    }

    sendForgottenPassword(users) {
      const { sendForgot } = this.props;

      users.map((user) => {
        sendForgot({ email: user.email }).then(() => {
          toast.success(`${messages.SEND_ADMIN_FORGOT_SUCCESS} ${user.first_name} ${user.last_name}`);
        }).catch(({ response: { data } }) => {
            if (data.errorCode === 20) {
                return toast.error(messages.EMAIL_NOT_CONFIRMED);
            } else if (data.errorCode === 21) {
                return toast.error(messages.ACCOUNT_CLOSED);
            } else if (data.errorCode === 22) {
                return toast.error(messages.ACCOUNT_SUSPENDED);
            } else if (data.errorCode === 23) {
                return toast.error(messages.ACCOUNT_DELETED);
            } else if (data.errorCode !== 0) {
                return toast.error(messages.EMAIL_NOT_FOUND);
            }
  
            return toast.error(messages.INTERNAL_SERVER_ERROR);
        });
      });
    }

    renderModalDialog() {
      const { show_modal, is_send_email, send_subject, send_content } = this.state;
      return (
        <Modal isOpen={show_modal} centered>
          <div className="modal-dialog-header">
              <img src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({show_modal: false})}/>
          </div>
          <ModalBody>
              <h5 className="modal-title text-center">{is_send_email?"Send Email":"Send Notification"}</h5>
              <form>
                  <div className="row">
                      <div className="col-12 form-group">
                          <label className="medium">Subject</label>
                          <input type="text" className="form-control" value={send_subject} id="send_subject" placeholder="Type the subject" onChange={this.handleInputChange} />
                      </div>
                      <div className="col-12 form-group">
                          <label className="medium">Content</label>
                          <div className="row">
                              <div className="col-12">
                                  <textarea name="text" className="form-control auto-expand" value={send_content} data-min-rows="5" placeholder="Type the content" data-max-rows="5" rows="5" id="send_content" onChange={this.handleInputChange} />
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="form-action">
                      <div className="row justify-content-end">
                          <div className="col-lg-4 col-sm-6 col-8">
                              <button className="btn btn-block btn-success" onClick={this.handleSendMessage}>Send</button>
                          </div>
                      </div>
                  </div>
              </form>
          </ModalBody>
      </Modal>
      )
    }

    renderUserTable () {
        const { columns, users, loading, offset, total, actions, defaultLimit, selectAll, selectedUsers, unselectedUsers } = this.state;

        const action_buttons =(
          <div className="action-buttons">
              {/* <div className="btn btn-primary btn-action" id="create_chat" >Create Chat</div> */}
              <div className="btn btn-primary btn-action" id="send_forgotten_password" onClick={() => this.handleForgottenPassword()}>Send Forgotten Password</div>
              <div className="btn btn-primary btn-action" id="send_email" onClick={()=>this.showModal(true)}>Send Email</div>
              <div className="btn btn-primary btn-action" id="send_notification" onClick={()=>this.showModal(false)}>Send Notification</div>
          </div>
        );

        const tableBody = users.map((user, key) => {
          let is_selected = false;
          if(selectAll) {
            if(!unselectedUsers.find(el=>el.id == user.id)){
              is_selected = true;
            }
          }else{
            if(selectedUsers.find(el=>el.id === user.id)){
              is_selected = true;
            }
          }
          return (
            <tr key={key}>
                <td><input type="checkbox" checked={is_selected} onChange={()=>this.handleSelectItem(user)} /></td>
                <td><div className="username">{user.first_name + " " + user.last_name}</div></td>
                <td>{user.email}</td>
                <td>{user.company}</td>
                <td><Score score={user.review?user.review.score:0} /></td>
                <td>
                  {user.availability?<Badge color="success">{"Available"}</Badge>:<Badge color="warning">Unavailable</Badge>}
                  {user.is_closed?<Badge color="danger">{"Closed"}</Badge>:null}
                  {user.is_suspended?<Badge color="danger">{"Suspended"}</Badge>:null}
                  {user.is_hided?<Badge color="danger">{"Hided"}</Badge>:null}
                </td>
                <td>
                  <TableActions item={user} type={'user'} actions={actions} handleAction={this.handleAction}/>
                </td>
            </tr>
          )
        });

        return (
          <TableView columns={columns} tableBody={tableBody}
            action_buttons={action_buttons}
            tableHeader={"users"}
            selectEnable={false}
            placeholder={"Search User"}
            limitEnable={false}
            limit={defaultLimit}
            handleRecordSearch={this.handleRecordSearch}
            handleSelectAll={this.handleSelectAll}
            selectAll={selectAll}
            onPagination={this.onPagination}
            loading={loading}
            page={offset}
            isPagination={true}
            total={total}/>
        )
    }
  render() {
    return (
      <div className="animated fadeIn">
        {this.renderModalDialog()}
        {this.renderUserTable()}
      </div>

    );
  }
}

Users.propTypes = {
  getUsers: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  createChat: PropTypes.func.isRequired,
  sendNotification: PropTypes.func.isRequired,
  sendEmail: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  sendForgot: PropTypes.func.isRequired
};


export default connect(
  selectors,
  {
    ...actions.chat,
    ...actions.users,
    ...actions.authentication
  },
)(withRouter(Users));
