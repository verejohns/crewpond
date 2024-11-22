import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import { constant, messages, paths } from "../../../../../utils";
import selectors from "./selectors";
import actions from "../../actions";
import {set, isEmpty} from 'lodash';
import { validation } from '../../../../../utils';
import moment from 'moment';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import {toast} from 'react-toastify';
import { ImageUpload, Select, Switch, DateInputPicker } from "../../../components";
import { Modal, ModalBody } from 'reactstrap';
import { ClipLoader } from 'react-spinners';

class Subscriptions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            query: {},
            limit: 10,
            lastValue: null,
            feedbacks: [],
            isEdit: false,
            isOpen: false,
            isJobber: false,
            isConfirmDlg: false,
            modalTitle: "",
            modalDescription: "",
            isShowKeyHirer: false,
            isUpdatingKey: false,
            subscriptions: []
        };
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
        this.handleClick = this.handleClick.bind(this);
        this.toggleSuper = this.toggleSuper.bind(this);
        this.toggleKeyJobber = this.toggleKeyJobber.bind(this);
        this.hadnleCloseConfirm = this.hadnleCloseConfirm.bind(this);
    }

    componentDidMount() {
        const { getUser, listSubscriptions, match: {params} } = this.props;

        let user_id = null;

        if(params && params.id) {
            this.setState({isJobber: true});
            user_id = params.id;
        }else
            user_id = this.authUser.id;

        const self = this;

        getUser(user_id)
        .then(({result: {data}}) => {
            this.setState({
                user: data.user,
            })
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });

        listSubscriptions().then((result)=>{
            //TODO: Add error handling
            this.setState({subscriptions: result.result.data.data});
        });
    }

    toggleSuper(checked) {
        let {user} = this.state;
        user.is_super = checked;
        this.setState({
            user, 
            isShowKeyHirer: true,
            isConfirmDlg: true,
            modalTitle: checked?"Purchase":"Unsubscribe",
            modalDescription: checked?messages.PURCHASE_KEY_HIRER_CONFIRM:messages.CANCEL_KEY_HIRER_CONFIRM
        });
    }

    toggleKeyJobber(checked) {
        let {user} = this.state;
        user.is_key_jobber = checked;
        this.setState({
            user, 
            isShowKeyHirer: false,
            isConfirmDlg: true,
            modalTitle: checked?"Key Jobber Purchase":"Confirmation",
            modalDescription: checked?messages.PURCHASE_KEY_JOBBER_CONFIRM:messages.CANCEL_KEY_JOBBER_CONFIRM
        });
    }

    handleClick(ev) {
        const { createSuperUser, createKeyJobber, cancelSuperUser, cancelKeyJobber, listSubscriptions, match: {params}} = this.props;
        let {user, query, isShowKeyHirer, isUpdatingKey} = this.state;

        if (ev.target.id === 'purchase_key' && isUpdatingKey === false) {
            this.setState({isUpdatingKey: true})
            if(isShowKeyHirer) {
                if(user.is_super) {
                    createSuperUser()
                    .then(() => {
                        query.is_super = true;
                        this.setState({
                            query, isConfirmDlg: false,
                            isUpdatingKey: false
                        });
                        window.location.reload(false);
                    }).catch(() => {
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                        user.is_super = false;
                        this.setState({user, isUpdatingKey: false})
                    })
                }else {
                    cancelSuperUser()
                    .then(() => {
                        query.is_super = false;
                        this.setState({
                            query, isConfirmDlg: false,
                            isUpdatingKey: false
                        });
                        window.location.reload(false);
                    }).catch(() => {
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                        user.is_super = true;
                        this.setState({user, isUpdatingKey: false})
                    })
                }
            }else {
                if(user.is_key_jobber) {
                    const payment_method =  JSON.parse(localStorage.getItem(constant.PAYMENT_METHOD));
                    
                    createKeyJobber({ payment_method_id: payment_method.id })
                    .then(() => {
                        query.is_key_jobber = true;
                        this.setState({
                            query, isConfirmDlg: false,
                            isUpdatingKey: false
                        });
                        window.location.reload(false);
                    }).catch(() => {
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                        user.is_key_jobber = false;
                        this.setState({user, isUpdatingKey: false})
                    })
                }else {
                    cancelKeyJobber()
                    .then(() => {
                        query.is_key_jobber = false;
                        this.setState({
                            query, isConfirmDlg: false,
                            isUpdatingKey: false
                        });
                        window.location.reload(false);
                    }).catch(() => {
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                        user.is_key_jobber = true;
                        this.setState({user, isUpdatingKey: false})
                    })
                }
            }
        }
        
    }

    hadnleCloseConfirm = () => {
        let {user, isShowKeyHirer} = this.state;
        if(isShowKeyHirer) {
            user.is_key_hirer = !user.is_key_hirer;
        }else {
            user.is_key_jobber = !user.is_key_jobber;
        }
        this.setState({
            user, isConfirmDlg: false
        })
    }

    renderConfirmDialog() {
        const {isConfirmDlg, modalTitle, modalDescription, isUpdatingKey} = this.state;
        return (
            <Modal isOpen={isConfirmDlg} className="confirm-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={this.hadnleCloseConfirm}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">{modalTitle}</h5>
                    <div className="modal-description">
                        {modalDescription}
                    </div>
                    <div className="footer">
                        <button className="btn btn-outline-success" onClick={this.hadnleCloseConfirm}>No</button>
                        <button className="btn btn-success" id="purchase_key" onClick={this.handleClick}>{isUpdatingKey === true?<ClipLoader size={15} color={"#FFFFFF"}/>:"Yes"}</button>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    renderAction () {
        const {isEdit, isJobber, user} = this.state;

        if(!isJobber){
            if(!isEdit){
                return (
                    <div className="action">
                        <img src="/static/images/icons/icon-edit-gray.svg" alt="" id="profile_edit" onClick={this.handleClick}/>
                    </div>
                );
            }else return null;
        }else {
            return (
                <div className="action">
                    <img src="/static/images/icons/icon-comment.svg" alt="" id="profile_chat" onClick={this.handleClick}/>
                    {/* <img src="/static/images/icons/icon-flash.svg" alt="" id="profile_flash" onClick={this.handleClick}/> */}
                    <img src={user.is_favorite?"/static/images/icons/icon-star-green.svg":"/static/images/icons/icon-star.svg"} alt="" id="profile_favorite" onClick={this.handleClick}/>
                </div>
            );
        }
    }

    render () {
        TimeAgo.addLocale(en);
        const timeAgo = new TimeAgo('en-US');
        const { user: { is_super, is_key_jobber }, subscriptions } = this.state;
        
        return (
            <div className="user-profile-card">
                {this.renderConfirmDialog()}
                <div className="card">
                    <div className="card-body">
                        <h3 className="title">My Subscriptions</h3>
                        <div className="divder-line mt-3"></div>
                        {subscriptions.map((s_item, s_index) => {
                            var endDate = s_item.current_period_end;
                            var endDateMoment = moment.unix(endDate);
                            var cancelledDate = s_item.canceled_at;
                            var cancelledDateMoment = moment.unix(cancelledDate);
                            return(<>
                                <div className="user-description d-flex">
                                    <div className="left-wrapper-alt">
                                        <div className="user-info-item">
                                            <h5 className="title"><strong>Web Portal - {s_item.plan.nickname}</strong></h5>{s_item.status=='trialing'?(<span style={{color: "red"}}>Free trial ends: {endDateMoment.format("MMMM DD")}</span>):null}
                                            {(s_item.status == 'trialing' || s_item.status == 'active') &&
                                                <div className="description">Next Invoice on {endDateMoment.format("MMMM DD")} for ${s_item.plan.amount/100}</div>
                                            }
                                            {s_item.status == 'canceled' &&
                                                <div className="description">Subscription cancelled on {cancelledDateMoment.format("MMMM DD")}</div>
                                            }
                                        </div>
                                    </div>
                                    {s_item.plan.nickname == 'Super User' && (s_item.status == 'trialing' || s_item.status == 'active')?
                                    <div className="right-wrapper-alt"><Switch checked={is_super} name="isSuperUser" onChange={this.toggleSuper}></Switch></div>
                                    : null }
                                    {s_item.plan.nickname == 'Key Jobber' && s_item.status == 'active'?
                                    <div className="right-wrapper-alt"><Switch checked={is_key_jobber} name="isKeyJobber" onChange={this.toggleKeyJobber}></Switch></div>
                                    : null }
                                </div>
                            </>);
                        })}

                        {!is_key_jobber && <>
                            <h3 className="title">Optional Add-Ons</h3>
                            <div className="divder-line mt-3"></div>

                            <div className="user-description d-flex">
                                    <div className="left-wrapper-alt">
                                        <div className="user-info-item">
                                            <h5 className="title"><strong>Key Jobber</strong></h5>
                                            <div className="description">Stand out from the crowd and be one of the top-searched Jobbers for only $5.50 a month.</div>   
                                        </div>
                                    </div>
                                    <div className="right-wrapper-alt"><Switch checked={is_key_jobber} name="isKeyJobber" onChange={this.toggleKeyJobber}></Switch></div>
                            </div>
                        </>}
                    </div>
                </div>
               
            </div>
        )
    }
}

Subscriptions.propTypes = {
    listSubscriptions: PropTypes.func.isRequired,
    getUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    getFeedbacks: PropTypes.func.isRequired,
    getJobberType: PropTypes.func.isRequired,
    getChatRoomByJobber: PropTypes.func.isRequired,
    favoriteJobber: PropTypes.func.isRequired,
    createKeyHirer: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func.isRequired,
    createSuperUser: PropTypes.func.isRequired,
    cancelSuperUser: PropTypes.func.isRequired,
    createKeyJobber: PropTypes.func.isRequired,
    cancelKeyJobber: PropTypes.func.isRequired,
    createChat: PropTypes.func,
    user: PropTypes.object,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired
};

export default connect(
    selectors,
    {
        ...actions.users,
        ...actions.feedbacks,
        ...actions.chats,
        ...actions.favorite,
        ...actions.subscription
    }
)(Subscriptions);
