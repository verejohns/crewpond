import React, { Component } from 'react'
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { withRouter } from 'react-router-dom';
import selectors from './selectors';
import actions from '../../../actions';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { UserCell } from '../../../components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Email extends Component {
    constructor(props) {
        super(props);
        this.state = {
          editorState: EditorState.createEmpty(),
          keyword: '',
          users: [],
          selected_users: [],
          total: 1,
          lastValue: null,
          limit: 10,
          loading: false,
        };

        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSelectUser = this.handleSelectUser.bind(this);
        this.loadMoreUsers = this.loadMoreUsers.bind(this);
    }

    componentDidMount(){
        const { getUsers } = this.props;
        const { limit } = this.state;

        this.setState({
          loading: true
        });

        getUsers({orderBy: 'createdAt', limit: limit, keyword: ''})
        .then(({result: {data}}) => {
            this.setState({
                users:data.users,
                total: data.total,
                loading: false
            });
        }).catch(({ response: { data } }) => {
            toast.error(data.msg, {
                position: "top-left",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
            });
            this.setState({
                loading: false
            })
        });
    }

    onEditorStateChange(editorState){
        this.setState({
          editorState,
        });
    };

    loadMoreUsers() {

    }

    handleSelectUser(user) {

    }

    handleInputChange({target: {id, value}}){

    }

    handleKeyPress(e) {

    }
    
    render() {
        const { editorState, keyword, users } = this.state;
        return (
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer/>
                    <div className="row">
                        <div className="col-md-4 col-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="header">
                                        <div className="input-group search-user-room">
                                            <div className="input-group-prepend">
                                                <img src="/static/images/icons/icon-search.svg" alt="" />
                                            </div>
                                            <input type="text" className="form-control search-input-user" placeholder="Search ..." value={keyword} id="search_chat_room" onChange={this.handleInputChange} onKeyPress={this.handleKeyPress}/>
                                        </div>
                                    </div>
                                    <div className="body">
                                        <PerfectScrollbar
                                            onYReachEnd={this.loadMoreUsers}
                                            options={{
                                                suppressScrollX: true
                                            }}
                                        >
                                            <div className="user-list">
                                                {users.map((user, key) => <UserCell key={key} user={user} onClick={() => this.handleSelectUser(user)}/>)}
                                            </div>
                                        </PerfectScrollbar>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8 col-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="header">
                                    </div>
                                    <div className="body">
                                        <Editor
                                            editorState={editorState}
                                            wrapperClassName="wrapper-class"
                                            editorClassName="editor-class"
                                            toolbarClassName="toolbar-class"
                                            onEditorStateChange={this.onEditorStateChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


Email.propTypes = {
  getUsers: PropTypes.func.isRequired,
};


export default connect(
  selectors,
  {
    ...actions.users
  },
)(withRouter(Email));
