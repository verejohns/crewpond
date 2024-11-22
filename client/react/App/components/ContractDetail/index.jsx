import React, { Component } from "react";
import { toast } from 'react-toastify';
import { Loader } from "../../../components";
import { Score } from '../../../components';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { JobberCollapse, ScheduleCollapse, InvoiceDialog, WorkTimesCollapse } from '../';
import { Modal, ModalBody} from 'reactstrap';

import selectors from "./selectors";
import actions from "../../actions";
import connect from "react-redux/es/connect/connect";
import PropTypes from "prop-types";
import moment from 'moment';
import { paths, messages, constant } from '../../../../../utils';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import {Link} from "react-router-dom";
import 'react-tabs/style/react-tabs.css';

class ContractDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalTitle: "",
            modalDescription: "",
            contract: null,
            contracts: [],
            contractState: 'normal',
            allSchedules: [],
            assignSchedule: false,
            contract_close_reason: true,  // true: completed, false: cancelled
            score: 0, 
            cancel_reason: "", 
            feedback_comment: "",
            sentFeedback: null,
            invoices: [],
            isWorkHourDlg: false,
            isLoadingInvoices: false,
            isOpen: false,
            isOpenFeedback: false,
            isOpenInvoice: false,
            worktimes: [],
            lastInvoice: null,
            closeOneContract: false
        }
        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;

        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    componentDidMount() {
        const { id } = this.props;

        this.getContract(id);
        this.getWorkTimes(id);
    }

    getWorkTimes = (id) => {
        const { getWorkTimes } = this.props;
        getWorkTimes({contract_id: id, orderBy: this.orderBy})
        .then(({result: {data}}) => {
            this.setState({worktimes: data.work_times});
        })
    }
    
    getInvoices = (id) => {
        const { isHirerView , getAllReceivedInvoices, getAllSentInvoices} = this.props;
        const {contract} = this.state;
        this.setState({isLoadingInvoices: true});
        let params = {
            orderBy: this.orderBy,
            contractId: id,
            jobId: contract.job.id
        };
        
        if(!isHirerView){
            getAllSentInvoices(params).then(({ result: { data } }) => {
                let { invoices } = this.state;
                invoices = data.invoices;
                this.lastValue = data.lastValue;
                this.setState({ invoices, isLoadingInvoices: false }, () => {
                    if (data.invoices.length > 0 && data.invoices.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });    
        }else {
            getAllReceivedInvoices(params).then(({ result: { data } }) => {
                let { invoices } = this.state;
                invoices = data.invoices;
                this.lastValue = data.lastValue;
                this.setState({ invoices, isLoadingInvoices: false }, () => {
                    if (data.invoices.length > 0 && data.invoices.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });    
        }
    }

    onSubmit = () => {
        const { id } = this.props;
        this.setState({isOpenInvoice: false});
        this.lastValue = null;
        this.getInvoices(id);
    }

    loadMore = () => {
        const {isLoadingInvoices} = this.state;
        const {id} = this.props
        if (!isLoadingInvoices && window.scrollY + window.innerHeight >= document.body.clientHeight) {
            this.getInvoices(id);
        }
    };

    componentWillReceiveProps(nextProps, nextContext) {
        const { id } = this.props;

        if (nextProps.id !== id) {
            this.getContract(nextProps.id);
        }
    }

    getContracts(jobId) {
        const { getContracts } = this.props;
        getContracts({job_id: jobId})
        .then(({result: {data}}) => {
            this.setState({
                contracts: data.contracts
            });
        })
    }

    getJobById(jobId) {
        const {getJobById} = this.props;
        getJobById(jobId)
        .then(({result: {data}}) => {
            this.setState({
                allSchedules: data.job.schedules
            });
        })
    }

    getContract = (id) => {
        const { getContractById, isHirerView, getBadgeCount } = this.props;
        getContractById(id)
        .then(({result:{ data }}) => {
            let contractState = 'normal';
            if(data.contract.closed_at) {
                contractState = 'closed';
                if(isHirerView === true && data.contract.archive_hirer === true){
                    contractState = 'archived';
                }
                if(isHirerView === false && data.contract.archive_jobber === true){
                    contractState = 'archived';
                }
            }
            this.setState({
                contract: data.contract,
                contractState
            });

            if(data.contract) {
                this.getJobById(data.contract.job_id);
                this.getContracts(data.contract.job_id);
                this.getInvoices(id);
            }
            getBadgeCount();
        });
    }

    closeContract = (id) => {
        const {closeContract} = this.props;
        const {contract} = this.state;
        closeContract(id)
        .then(() => {
            this.getContracts(contract.job.id);
        })
    }

    handleAssignToJobber = (type, schedule, contractId) => {
        const {assignSchedules, unassignSchedules} = this.props;
        let {contracts} = this.state;
        const cId = contracts.findIndex(el=>el.id == contractId);
        let contract = contracts[cId];
        if(type === 'assign_schedule') {
            assignSchedules({schedule_ids: [schedule.id], contract_id: contractId})
            .then(() => {
                contract.schedules.push(schedule);
                contract.schedule_ids.push(schedule.id.toString());
                contracts[cId] = contract;
                this.setState({contracts});
            })
        }else if(type === 'unassign_schedule') {
            unassignSchedules({schedule_ids: [schedule.id], contract_id: contractId})
            .then(() => {
                contract.schedules = contract.schedules.filter(el=>el.id !== schedule.id);
                contract.schedule_ids = contract.schedule_ids.filter(el=>el !== schedule.id.toString());
                contracts[cId] = contract;
                this.setState({contracts});
            })
        }
    }

    handleClick = (ev) => {
        ev.preventDefault();
        const { assignSchedule, contract } = this.state;
        const { history: { push } } = this.props;
        if(ev.target.id === 'close_all_contracts') {
            if (contract.job.is_urgent) {
                this.setState({
                    isOpen: true,
                    modalTitle: "Close All Contracts",
                    modalDescription: "Closing all contracts confirms SOS payments.Are you sure to you want to close all contracts?"
                });
            } else {
                this.setState({
                    isOpen: true,
                    modalTitle: "Close All Contracts",
                    modalDescription: "Are you sure to you want to close all contracts?"
                });
            }
            
        }else if(ev.target.id === 'archieve_all_contracts') {
            this.setState({
                isOpen: true,
                modalTitle: "Archive All Contracts",
                modalDescription: "Are you sure to you want to archive all contracts?"
            });
        }else if(ev.target.id === 'close_all_confirm') {
                        const {closeAllContract, id} = this.props;
            closeAllContract({job_id: contract.job_id, need_purchase: contract.job.is_urgent})
            .then(({result: {data}}) => {
                this.setState({
                    isOpen: false,
                });
                this.getContract(id);
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }else if(ev.target.id === 'archieve_all_confirm') {
                        const { archieveAllContracts, id } = this.props;

            archieveAllContracts(contract.job_id)
            .then(({result: {data}}) => {
                this.setState({
                    isOpen: false
                });
                this.getContract(id);

                window.location.reload(false);
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }else if(ev.target.id === 'assign_schedule') {
            this.setState({assignSchedule: !assignSchedule})
        }else if(ev.target.id === 'close_contract') {

            this.setState({
                isOpen: true,
                modalTitle: "Close Contract",
                modalDescription: "Are you sure to you want to close this contract?",
                closeOneContract: true
            });

        } else if(ev.target.id === 'close_one_confirm') {
            const {closeContract, id} = this.props;

            closeContract(id)
            .then(() => {
                this.getContract(id);
                this.setState({
                    closeOneContract: false,
                    modalTitle: "Archive Contract",
                    modalDescription: "Are you sure to you want to archive this contract?"
                });
            })
        } else if(ev.target.id === 'archieve_contract') {
            const { archieveContract, id } = this.props;
            archieveContract(id)
            .then(() => {
                this.getContract(id);

                window.location.reload(false);
            })
        }else if(ev.target.id === 'add_working_hours') {
            const {id} = this.props;
            push(`${paths.client.APP_WOKRING_HOURS}?contractId=${id}`);
        }else if(ev.target.id === 'generate_invoice') {
            const { getLastInvoice } = this.props;
            getLastInvoice()
            .then(({result: {data}}) => {
                this.setState({
                    isOpenInvoice: true, 
                    lastInvoice: data.invoice_info
                });
            })
            
        }
    }

    handleClose = () => {
        this.setState({
            isOpen: false
        });
    }

    showFeedback = () => {
        this.setState({
            isOpenFeedback: true
        });
    }

    handleContractCloseReason = (id) => {
        this.setState({
            contract_close_reason: id === 'contract_completed'?true:false
        });
    }

    handleRate = (score) => {
        this.setState({score});
    }

    handleInputChange = ({target: {id, value}}) => {
        this.setState({
            [id]: value
        });
    }

    handleSendFeedback = (ev) => {
        ev.preventDefault();
        const {createFeedback} = this.props;
        const {contract_close_reason, cancel_reason, feedback_comment, score, contract} = this.state;

        let params = {};
        params.contract_id = contract.id;
        params.comment = feedback_comment;
        if(contract_close_reason === false) {
            params.failure_reason = cancel_reason;
        }
        params.success = contract_close_reason;
        params.score = score;
        createFeedback(params)
        .then(() => {
            this.setState({
                isOpenFeedback: false,
                sentFeedback: score
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
            this.setState({isOpenFeedback: false});
        });
    }

    handleDownloadInvoice = (ev, item) => {
        ev.preventDefault();
        const { getInvoiceById } = this.props;
        const { contract } = this.state;
        // console.log(moment().utcOffset());
        getInvoiceById(item.id, moment().utcOffset())
        .then(({result: {data}}) => {
            console.log(data);
            let a = document.createElement('a');
            a.href = data.invoice.download_link;
            if (data.invoice.invoice_no) {
                if (data.invoice.sender_abn) {
                    a.download = data.invoice.sender_username + " " + data.invoice.sender_abn + " " + data.invoice.invoice_no;
                } else {
                    a.download = data.invoice.sender_username + " " + data.invoice.invoice_no;
                }
            } else {
                if (data.invoice.sender_abn) {
                    a.download = data.invoice.sender_username + " " + data.invoice.sender_abn + " " + moment().unix();
                } else {
                    a.download = data.invoice.sender_username + " " + moment().unix();
                }
            }
            //a.download = data.invoice.sender_username + " " + data.invoice.sender_abn + " " + data.invoice.invoice_no;
            a.click();
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    renderFeedback() {
        const {isOpenFeedback, contract_close_reason, score, cancel_reason, feedback_comment, contract} = this.state;
        //check contract closed by whom
        const closed_by_myself = contract.closed_by === this.authUser.id;

        TimeAgo.addLocale(en)
        const timeAgo = new TimeAgo('en-US');
        return (
            <Modal isOpen={isOpenFeedback} className="feedback-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isOpenFeedback: false})}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Send Feedback</h5>
                    <div className="contract-row">
                        <h5>{contract.job.title}</h5>
                        <div className="jobber-info">
                            <div className={"avatar" + (contract.hirer.avatar?"":" no-border")}>
                                <img src={contract.hirer.avatar?contract.hirer.avatar:"/static/images/avatar.png"} alt=""/>
                            </div>
                            <div className="left-wrapper">
                                <div className="name">{contract.hirer.first_name + " " + contract.hirer.last_name}</div>
                                <div className="row">
                                    <div className="col-6">
                                        <div className="offer-price">
                                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                            <span>{contract.price ? `$${contract.price}` : `-`}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="due-date">
                                            <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                            <span>{contract.due_date?moment(contract.due_date).format("DD/MM/YYYY"):"-"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="schedule-row">
                            <span>{"Closed"}</span>
                            <div className="schedule-due">
                                <div className="row">
                                    <div className="col-6">
                                        <span>{"Started at"}</span>
                                    </div>
                                    <div className="col-16">
                                        <span>{timeAgo.format(moment(contract.createdAt).toDate())}</span>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <span>{"Closed at"}</span>
                                    </div>
                                    <div className="col-16">
                                        <span>{timeAgo.format(moment(contract.closed_at).toDate())}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={this.handleSendFeedback}>
                        <h5>Reason or ending project</h5>
                        <div className="contract-close-reason" id="contract_completed" onClick={() => this.handleContractCloseReason("contract_completed")}>
                            <div>Job completed successfully</div>
                            {contract_close_reason?<span className="fa fa-check"></span>:null}
                        </div>
                        <div className="contract-close-reason" id="contract_cancelled" onClick={() => this.handleContractCloseReason("contract_cancelled")}>
                            <div>{"Job cancelled for (if the user, NOT YOU! has cancelled)"}</div>
                            {!contract_close_reason?<span className="fa fa-check"></span>:null}
                        </div>
                        {!contract_close_reason?<input type="text" className="form-control dark-input mt-3" id="cancel_reason" value={cancel_reason}
                             onChange={this.handleInputChange}></input>:null}
                        <div className="row mt-3">
                            <div className="col-lg-6 col-md-12"><h5>Feedback to opponent</h5></div>
                            <div className="col-lg-6 col-md-12">
                                <Score score={score} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"} 
                                        size={"25px"} onConfirmRate={this.handleRate} disabled={false}/>
                            </div>
                        </div>
                        <h5>Comment:</h5>
                        <textarea className="form-control dark-input mt-3" id="feedback_comment" value={feedback_comment}
                            onChange={this.handleInputChange}></textarea>
                        <div className="footer">
                            <button className="btn btn-success">Send Feedback</button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        )
    }

    renderConfirmDialog() {
        const {isOpen, modalTitle, modalDescription, contractState, closeOneContract, contract} = this.state;
        return (
            <Modal isOpen={isOpen} className="confirm-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={this.handleClose}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">{modalTitle}</h5>
                    <div className="modal-description">
                        {modalDescription}
                    </div>
                    <div className="footer">
                        <button className="btn btn-outline-success" onClick={this.handleClose}>No</button>
                        {
                        closeOneContract ?
                        <button className="btn btn-success" id="close_one_confirm" onClick={this.handleClick}>Yes</button> :
                        <>
                            {
                            contractState === 'closed' && contract.job.is_completed ?
                            <button className="btn btn-success" id="archieve_all_confirm" onClick={this.handleClick}>Yes</button> :
                            <button className="btn btn-success" id="close_all_confirm" onClick={this.handleClick}>Yes</button>
                            }
                        </>
                        }
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    render() {
        const { isLoading, isHirerView, history } = this.props;
        const { contractState, allSchedules, contract, contracts, worktimes, assignSchedule, sentFeedback, invoices, isOpenInvoice, lastInvoice } = this.state;

        if (isLoading || !contract) {
            return (
                <Loader />
            );
        }
        const received_feedback = contract.feedbacks?contract.feedbacks.find(el=>el.to_user_id === this.authUser.id):null;
        const sent_feedback = sentFeedback || (contract.feedbacks?contract.feedbacks.find(el=>el.from_user_id === this.authUser.id):null);
        const avatar = contract.hirer.avatar ? contract.hirer.avatar : null;

        return (
            <div className="detail-container">
                <InvoiceDialog isOpen={isOpenInvoice} contract={contract} lastInvoice={lastInvoice} onSubmit={this.onSubmit} handleClose={() => this.setState({isOpenInvoice: false})}></InvoiceDialog>
                {this.renderFeedback()}
                {this.renderConfirmDialog()}
                <div className="slider-header status">
                    <span className="active">Open</span>
                    <span className={contract.job.is_assigned ? "active" : null}>Assigned</span>
                    <span className={contract.job.is_completed ? "active" : null}>Completed</span>
                </div>

                <section>
                    <div className="flex-wrapper">
                        <div className="left-wrapper">
                            <h5>{contract.job.title}</h5>
                        </div>

                        <div className="right-wrapper">
                            <span className="badge badge-dark">{contract.job.is_public ? "Public" : "Private"}</span>
                            {contract.job.is_urgent && (
                                <span className="badge badge-danger">SOS</span>
                            )}
                        </div>
                    </div>
                    <div className="jobber-row">
                        <div className={"avatar" + (avatar?"":" no-border")}>
                            <img src={avatar?avatar:'/static/images/avatar.png'} alt="" />
                        </div>
                        <div className="left-wrapper">
                            <div className="name">{contract.hirer.first_name + " " + contract.hirer.last_name}</div>
                            {contract.hirer.company && <div className="company">{contract.hirer.company}</div>}
                            {/* {(isHirerView === true && contract.jobber.company) && (
                                <div className="company">{contract.jobber.company}</div>
                            )} */}
                        </div>
                        <div className="right-wrapper">
                            <Link to={'/app/jobber/profile/' + contract.hirer_id} className="link-green mt-auto">View Profile</Link>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="row">
                        <div className="col-md-6 mb-md-0 mb-3">
                            <div className="row">
                                <div className="col-6 col-md-12 mb-md-3">
                                    <div className="offer-price">
                                        <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                        <span>{contract.price ? `$${contract.price}` : `-`}</span>
                                    </div>
                                </div>
                                <div className="col-6 col-md-12">
                                    <div className="hourly-rate">
                                        <img src="/static/images/icons/icon-hourglass-green.svg" alt="" />
                                        <span>{contract.is_hourly?"Hourly":"Fixed"}</span>
                                    </div>
                                </div>
                                <div className="col-6 col-md-12">
                                    <div className="started-at mt-3">
                                        <span>{"Started at " + moment(contract.createdAt).format("DD/MM/YYYY")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-md-0 mb-3">
                            <div className="row">
                                <div className="col-6 col-md-12 mb-md-3">
                                    <div className="remote-work">
                                        <img src="/static/images/icons/icon-location-green.svg" alt="" />
                                        <span>{contract.job.location.address?contract.job.location.address:'Remote'}</span>
                                    </div>
                                </div>
                                <div className="col-6 col-md-12">
                                    <div className="due-date">
                                        <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                        <span>{contract.due_date?moment(contract.due_date).format("DD/MM/YYYY"):"-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="fixed-row">
                        {isHirerView === true ?
                            ((contractState === 'closed' && contract.job.is_completed ?
                                <button className="btn btn-success btn-sm" id="archieve_all_contracts" onClick={this.handleClick}>Archive all contracts</button> :
                                <button className="btn btn-success btn-sm" id="close_all_contracts" onClick={this.handleClick}>Close all contracts</button>)
                            ) :
                            (contractState === 'normal' ?
                                <button className="btn btn-success btn-sm" id="close_contract" onClick={this.handleClick}>Close contract</button> :
                                (contractState === 'closed' ?
                                <button className="btn btn-success btn-sm" id="archieve_contract" onClick={this.handleClick}>Archive contract</button> :
                                null)
                            )}
                    </div>
                </section>
                {(isHirerView === false && contract.closed_at)?<div className="feedback-row">
                    <div className="left-wrapper">
                        <h4>Feedback</h4>
                        <div className="feedback">
                            {received_feedback?<Score score={received_feedback.score} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"} size={"25px"} />:<span>No feedback received</span>}
                        </div>
                    </div>
                    <div className="right-wrapper">
                        {!sent_feedback?<button className="btn btn-success btn-sm" onClick={this.showFeedback}>Send Feedback</button>:null}
                    </div>
                </div>:null}
                <Tabs>
                    <TabList>
                        <Tab className={"contract-tab" + (isHirerView === false?" jobber-view":'')} selectedClassName="selected-contract-tab">Schedules</Tab>
                        <Tab className={"contract-tab" + (isHirerView === false?" jobber-view":'')} selectedClassName="selected-contract-tab">Jobbers</Tab>
                        {isHirerView === false?<Tab className={"contract-tab" + (isHirerView === false?" jobber-view":'')} selectedClassName="selected-contract-tab">Work Hours</Tab>:null}
                        <Tab className={"contract-tab" + (isHirerView === false?" jobber-view":'')} selectedClassName="selected-contract-tab">Invoices - Timesheets</Tab>
                    </TabList>

                    <TabPanel>
                        {isHirerView === true?<div className="d-flex justify-content-end mt-3 mb-3">
                            <button className="btn btn-success btn-sm" id="assign_schedule" onClick={this.handleClick}>{assignSchedule?<span className="fa fa-check"></span>:null}Assign</button>
                        </div>:null}
                        {allSchedules.map((schedule, key) => {
                            return <ScheduleCollapse schedule={schedule}  assignSchedule={assignSchedule} contracts={contracts} isHirerView={isHirerView}
                                        key={key} handleAssign={this.handleAssignToJobber}/>
                        })}
                    </TabPanel>
                    <TabPanel>
                        {isHirerView === true?<div className="d-flex justify-content-end mt-3 mb-3">
                            <button className="btn btn-success btn-sm" id="assign_schedule" onClick={this.handleClick}>{assignSchedule?<span className="fa fa-check"></span>:null}Assign</button>
                        </div>:null}
                        {contracts.map((contractItem, key) => {
                            let newKey = Math.floor(Math.random() * 10000);
                            return <JobberCollapse history={history} isHirerView={isHirerView} contract={contractItem} allSchedules={allSchedules} assignSchedule={assignSchedule} handleAssign={this.handleAssignToJobber} handleCloseContract={this.closeContract} key={newKey}/>
                        })}
                    </TabPanel>
                    {isHirerView === false?
                    <TabPanel>
                        <div className="d-flex justify-content-center mt-3 mb-3">
                            <button className="btn btn-success" id="add_working_hours" onClick={this.handleClick}>Add Working Hours</button>
                        </div>
                        {worktimes.map((item, key) => {
                            return <WorkTimesCollapse worktime={item} key={key} history={history}/>
                        })}
                    </TabPanel>:null}
                    <TabPanel>
                        {isHirerView === false?<div className="d-flex justify-content-center mt-3 mb-3">
                            <button className="btn btn-success" id="generate_invoice" onClick={this.handleClick}>Generate Invoice - Timesheet</button></div>:null}

                        {invoices.map((item) => {
                            return (
                                <div className="content-wrapper mt-3" key={item.id}>
                                    <div className="header">{moment(item.invoice_date).format('MM/DD/YYYY')}</div>
                                    <div className="content">
                                        <div className="left-wrapper">
                                            <div className="title">Sent Invoices - Timesheet {item.invoice_no && item.invoice_no}</div>
                                            <span>{item.job_title}</span>
                                        </div>
                                        <div className="right-wrapper">
                                            <div className="action">
                                                <img src="/static/images/icons/icon-download.svg" onClick={(ev) => this.handleDownloadInvoice(ev, item)}/>
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <div className="footer">
                                        <div className="due-date">
                                            <span>{moment(item.invoice_date).format('MM/DD/YYYY')} - {moment(item.invoice_date).format('MM/DD/YYYY')}</span>
                                        </div>
                                        <div className="item">
                                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                            <span>{`$${(item.total_price % 1 === 0 ?item.total_price:item.total_price.toFixed(2))}`}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </TabPanel>
                </Tabs>
                
            </div>
        );
    }
}

ContractDetail.propTypes = {
    id: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    getContractById: PropTypes.func.isRequired,
    getContracts: PropTypes.func.isRequired,
    closeAllContract: PropTypes.func.isRequired,
    closeContract: PropTypes.func.isRequired,
    archieveAllContracts: PropTypes.func.isRequired,
    archieveContract: PropTypes.func.isRequired,
    getJobById: PropTypes.func.isRequired,
    assignSchedules: PropTypes.func.isRequired,
    unassignSchedules: PropTypes.func.isRequired,
    createFeedback: PropTypes.func.isRequired,
    getAllSentInvoices: PropTypes.func.isRequired,
    getAllReceivedInvoices: PropTypes.func.isRequired,
    getWorkTimes: PropTypes.func.isRequired,
    getLastInvoice: PropTypes.func.isRequired,
    getInvoiceById: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired
};

export default connect(
    selectors,
    { 
        ...actions.contracts,
        ...actions.jobs,
        ...actions.worktime,
        ...actions.feedbacks,
        ...actions.invoices,
        ...actions.notifications
    }
)(ContractDetail);
