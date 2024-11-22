import React, { Component } from "react";
import Select from 'react-select';
import { Modal, ModalBody } from 'reactstrap';
import { AddBank } from "../";
import { Switch, Checkbox } from "../../../components";
import { ClipLoader } from 'react-spinners';

import connect from "react-redux/es/connect/connect";
import PropTypes from "prop-types";
import actions from '../../actions';
import moment from "moment";
import { messages, functions, time, constant } from '../../../../../utils';
import { toast } from "react-toastify";

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: 0,
        borderRadius: 20,
        backgroundColor: "#E7EEF2"
     })
}

const customStylesValidation = {
    control: (base, state) => ({
        ...base,
        border: '1px solid red',
        borderRadius: 20,
        backgroundColor: "#E7EEF2"
     })
  }

class InvoiceDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            work_times: [],
            isOpenBank: false,
            is_gst_registered: false,
            bank_account_options: [],
            show_more_invoice: true,
            isCreatingBank: false,
            isSubmitting: false,
            bank_option: null,
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT)),
            noBankOptionSelected: false,
            jobber_type: null
        };
        this.orderBy = "id";
    }

    componentDidMount() {
        const { contract, getWorkTimes, lastInvoice } = this.props;
        const { authUser } = this.state;
        getWorkTimes({contract_id: contract.id, orderBy: this.orderBy})
        .then(({result: {data}}) => {
            this.setState({work_times: data.work_times});
        });
        this.loadBankAccounts();
        this.setState({is_gst_registered: lastInvoice && lastInvoice.is_gst_registered ? lastInvoice.is_gst_registered : false});
        this.setJobberType(authUser.jobber_type);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.lastInvoice !== prevProps.lastInvoice && this.props.lastInvoice) {
            // const jobber_type = this.jobberTypeOptions.find(el=>el.label == this.props.lastInvoice.jobber_type);
            this.setState({is_gst_registered: this.props.lastInvoice && this.props.lastInvoice.is_gst_registered ? this.props.lastInvoice.is_gst_registered : false});
        }
    }

    loadBankAccounts = () => {
        const { getAllBankAccounts } = this.props;
        getAllBankAccounts()
        .then(({result: {data}}) => {
            const bank_accounts = data.data;
            let bank_account_options = [{label: "Add Bank", value: 'new_bank'}];
            for(let i = 0; i < bank_accounts.length; i += 1) {
                bank_account_options.push({label: bank_accounts[i].bank_name, value: bank_accounts[i]});
            }
            this.setState({bank_account_options});
        });
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.isOpen !== nextProps.isOpen){
            this.setState({
                isOpen: nextProps.isOpen
            });
        }
    }

    toggleGST = () => {
        this.setState(prevState => ({
            is_gst_registered: !prevState.is_gst_registered
        }));
    }

    handleInputChange = ({target: {name, value}}) => {
        this.setState({[name]: value});
        
    }

    handleBankSubmit = (params) => {
        const {createBankAccount} = this.props;
        this.setState({isCreatingBank: true});
        createBankAccount(params).then(({result: {data}}) => {
            this.loadBankAccounts();
            this.setState({
                isOpenBank: false,
                isCreatingBank: false
            })
        }).catch(({ response: { data } }) => {
            this.setState({
                isOpenBank: false,
                isCreatingBank: false
            })
            return toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    handleCloseBank = () => {
        this.setState({isOpenBank: false})
    }

    selectBank = (opt) => {
        if(opt.value === 'new_bank') {
            this.setState({
                isOpenBank: true
            });
        }else {
            this.setState({bank_option: opt});
        }
    }

    setJobberType = (jobber_type_value) => {
        
        const jobberTypeOptions = [
            {label: 'Sole Trader', value: 'sole_trader'},
            {label: 'Company', value: 'company'},
            {label: 'Full Time Worker', value: 'full_time_worker'},
            {label: 'Casual Worker', value: 'casual_worker'}
        ];
        
        let setJobberType = jobberTypeOptions.find(el => el.value == jobber_type_value);

        this.setState({
            jobber_type: setJobberType
        });

        if(jobber_type_value === 'sole_trader' || jobber_type_value === 'company'){
            this.setState({
                show_more_invoice: true
            });
        }else {
            this.setState({
                show_more_invoice: false
            });
        }
    }

    handleSubmit = (ev) => {
        ev.preventDefault();
        const { isSubmitting, work_times, bank_option, jobber_type, show_more_invoice } = this.state;
        const { createInvoice, contract, handleClose, onSubmit } = this.props;
        this.formRef.classList.add('was-validated');
        if (!bank_option && show_more_invoice) {
            this.setState({ noBankOptionSelected: true });
            return toast.error("Please select an option from the Payment Details field");
        } else {
            this.setState({ noBankOptionSelected: false });
        }
        if (this.formRef.checkValidity() && !isSubmitting) {
            let params = functions.parseFormData(new FormData(this.formRef));
            params.jobber_type = jobber_type.label;
            if (show_more_invoice) {
                params.acc_name = bank_option.value.bank_name;
                params.bsb = bank_option.value.routing_number;
            }
            params.job_id = contract.job_id;
            params.contract_id = contract.id;
            params.hourly_price = contract.price;
            let worktime_ids = [];
            for(let i = 0; i < work_times.length; i += 1) {
                if(work_times[i].selected) 
                    worktime_ids.push(work_times[i].id);
            }
            params.worktime_ids = worktime_ids;
            this.setState({isSubmitting: true});
            createInvoice(params).then(() => {
                onSubmit();
                this.setState({isSubmitting: false});
                toast.success("Sent Invoice successfully");
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
                this.setState({isSubmitting: false});
            });
        }
    }

    onClickWorkTime = (item, key) => {
        let { work_times } = this.state;
        item.selected = item.selected?false:true;
        work_times[key] = item;
        this.setState({work_times});
    }
/**
 * job_id, contract_id, sender_trading_name, sender_abn,
            worktime_ids, acc_number, bsb, acc_name
 */
    render() {
        const { handleClose, lastInvoice } = this.props;
        const { authUser, isOpen, isOpenBank, jobber_type, show_more_invoice, work_times, isCreatingBank, bank_account_options, is_gst_registered, bank_option, isSubmitting, noBankOptionSelected } = this.state;

        return (
            <Modal isOpen={isOpen} className="invoice-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleClose}/>
                </div>
                <AddBank isOpen={isOpenBank} handleClose={this.handleCloseBank} isSubmitting={isCreatingBank} onCreate={this.handleBankSubmit}/>
                <ModalBody>
                    <h5 className="modal-title text-center">Send Invoice</h5>
                    <form ref={ref => this.formRef = ref} className="offer-form" onSubmit={this.handleSubmit} noValidate>
                        <div className="form-group row">
                            <div className="col-12">
                                <label style={{marginTop: "16px"}}>You are a: <strong>{jobber_type?.label}</strong></label>
                                {/* <Select styles={customStyles} className="dark-input" name="jobber_type" options={this.jobberTypeOptions} onChange={this.setJobberType} value={authUser.jobber_type} disabled={true}></Select> */}
                            </div>
                        </div>
                        <div className="row">
                            {show_more_invoice ? 
                                <div className={`form-group col-12 ${show_more_invoice?'col-lg-6':''}`}>
                                    <label>Invoice No.</label>
                                    <input type="number" className="form-control dark-input" name="invoice_no" required defaultValue={lastInvoice?lastInvoice.id:''}></input>
                                </div>
                            : null }
                            {show_more_invoice?<div className="form-group col-lg-6 col-12">
                                <label>Purchase Order</label>
                                <input type="text" className="form-control dark-input" name="purchase_order"></input>
                            </div>:null}
                        </div>
                        <div className="row">
                            <div className={`form-group col-12 ${show_more_invoice?'col-lg-6':''}`}>
                                <label>Invoice Date</label>
                                <input type="date" defaultValue={moment().format('YYYY-MM-DD')} placeholder="Choose a Date" className="form-control dark-input date-picker" name="invoice_date" required/>
                            </div>
                            {show_more_invoice?<div className="form-group col-lg-6 col-12">
                                <label>Due Date</label>
                                <input type="date" placeholder="Choose a Date" className="form-control dark-input date-picker" name="due_date" required/>
                            </div>:null}
                        </div>
                        <div className="row">
                            <div className="form-group col-lg-6 col-12">
                                <label>Your Email</label>
                                <input type="email" className="form-control dark-input" name="sender_email" required defaultValue={authUser.email}></input>
                            </div>
                            <div className="form-group col-lg-6 col-12">
                                <label>Your Company</label>
                                <input type="text" className="form-control dark-input" name="sender_company" required defaultValue={authUser.company}></input>
                            </div>
                        </div>
                        <div className="row">
                            <div className={`form-group col-12 ${show_more_invoice?'col-lg-6':''}`}>
                                <label>Your Contact Name</label>
                                <input type="text" className="form-control dark-input" name="sender_username" required defaultValue={authUser.first_name + " " + authUser.last_name}></input>
                            </div>
                            {show_more_invoice ?
                                <div className="form-group col-lg-6 col-12">
                                    <label>ABN</label>
                                    <input type="text" className="form-control dark-input" name="sender_abn" required defaultValue={lastInvoice?lastInvoice.sender_abn:''}></input>
                                </div>
                            : null }
                        </div>
                        {show_more_invoice ?
                        <div className="form-group row">
                            <div className="col-12 d-flex justify-content-between">
                                <label>GST Registered</label>
                                <Switch name="is_gst_registered" checked={is_gst_registered} onChange={this.toggleGST}/>
                            </div>
                        </div> : null}
                        {show_more_invoice && <div className="form-group row">
                            <div className="col-12 d-flex flex-column">
                                <label style={noBankOptionSelected? {color: "red"} : null}>Payment Details</label>
                                <Select styles={noBankOptionSelected? customStylesValidation : customStyles} className="dark-input" id="bank_option" value={bank_option} options={bank_account_options} onChange={this.selectBank}></Select>
                            </div>
                            <div className="form-group col-12 mt-3">
                                <label>Account Number</label>
                                <input type="text" className="form-control dark-input" name="account_nubmer" required></input>
                            </div>
                        </div>}
                        {work_times.map((item, key) => {
                            const duration = moment.duration(moment(item.to).diff(moment(item.from))) / 1000;
                            return (
                                <div className="worktime clickable" key={key} onClick={() => this.onClickWorkTime(item, key)}>
                                    <Checkbox
                                        className="circle transparent"
                                        checked={item.selected}
                                        disabled
                                    />
                                    <div className="indicator">
                                        <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                                    </div>
                                    <div className="content">
                                        <div className="top">
                                            <span className="date">{moment(item.from).format("DD/MM/YYYY")}</span>
                                            <span className="duration mr-5">{time.hhmmss(duration, false)}</span>
                                        </div>
                                        <div className="bottom">
                                            <div className="name">{item.schedule.name}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="footer">
                            <button type="button" className="btn btn-outline-success mr-3" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-success">{isSubmitting?<ClipLoader size={15} color={"#FFFFFF"}/>:"Send"}</button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        );
    }
}

InvoiceDialog.defaultProps = {
    isOpen: false,
    lastInvoice: null
};

InvoiceDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    contract: PropTypes.object.isRequired,
    lastInvoice: PropTypes.object,
    getWorkTimes: PropTypes.func.isRequired,
    getAllBankAccounts: PropTypes.func.isRequired,
    createBankAccount: PropTypes.func.isRequired,
    createInvoice: PropTypes.func.isRequired,
    handleClose: PropTypes.func,
    onSubmit: PropTypes.func,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired
};

export default connect(
    null,
    { 
        ...actions.payments,
        ...actions.worktime,
        ...actions.invoices
    }
)(InvoiceDialog);
