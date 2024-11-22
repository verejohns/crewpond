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

import { Score } from '../../../components';
import { SkillSelect } from '../../components';
import {toast} from 'react-toastify';
import { ImageUpload, Select, Switch, DateInputPicker } from "../../../components";
import { Modal, ModalBody } from 'reactstrap';
import { ClipLoader } from 'react-spinners';
import PlacesAutocomplete, { geocodeByAddress,
    geocodeByPlaceId,
    getLatLng } from 'react-places-autocomplete'

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: '1 !important',
        borderRadius: 20,
        backgroundColor: "#E7EEF2"
     })
}

class Profile extends Component {
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
            avatar: null,
            jobber_types: [],
            isJobber: false,
            isConfirmDlg: false,
            modalTitle: "",
            modalDescription: "",
            isShowKeyHirer: false,
            isUpdatingKey: false
        };

        this.autocomplete = null;
        this.jobberTypeOptions = [
            {label: 'Sole Trader', value: 'sole_trader'},
            {label: 'Company', value: 'company'},
            {label: 'Full Time Worker', value: 'full_time_worker'},
            {label: 'Casual Worker', value: 'casual_worker'}
        ];
        this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleRemoveSkill = this.handleRemoveSkill.bind(this);
        this.handleAddSkill = this.handleAddSkill.bind(this);
        this.selectCategory = this.selectCategory.bind(this);
        this.toggleAvailability = this.toggleAvailability.bind(this);
        this.toggleSuper = this.toggleSuper.bind(this);
        this.toggleKeyJobber = this.toggleKeyJobber.bind(this);
        this.onAvatarChange = this.onAvatarChange.bind(this);
        this.selectJobberType = this.selectJobberType.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    // handlePlaceSelect() {
    //     let addressObject = this.autocomplete.getPlace()
    //     let {user, query} = this.state;

    //     let address = addressObject.address_components;
    //     // let location = {};
    //     // location.address = addressObject.name;
    //     // for(let i = 0; i < address.length; i += 1) {
    //     //     location.place_name += address[0].long_name + " ";
    //     // }
    //     // location.latitude = addressObject.geometry.location.lat();
    //     // location.longitude = addressObject.geometry.location.lng();

    //     set(user, 'location', location);
    //     set(query, 'location', location);

    //     this.setState({user, query});
    // }
    
    handlePlaceChange = (address) => {
        
        let {user, query} = this.state;
        
        let location = {};
        location.address = address;

        set(user, 'location', location);
        set(query, 'location', location);

        this.setState({user, query});
    };

    handlePlaceSelect = (address) => {
        
        let {user, query} = this.state;
        let location = {};

        geocodeByAddress(address)
        .then(results => getLatLng(results[0]))
        .then(latLng => {

            location.address = address;
            location.place_name = address.split(" ")[0];
            location.latitude = latLng.lat;
            location.longitude = latLng.lng;

            set(user, 'location', location);
            set(query, 'location', location);

            this.setState({user, query});
            
        }).catch(error => console.error('Error', error));
    };

    componentDidMount() {
        const { getUser, getFeedbacks, getJobberType, match: {params} } = this.props;
        const {user, limit, lastValue} = this.state;

        let user_id = null;

        if(params && params.id) {
            this.setState({isJobber: true});
            user_id = params.id;
        }else
            user_id = this.authUser.id;
        const self = this;
        // setTimeout(function(){ 
        //     const element = document.getElementById('autocomplete');
        //     self.autocomplete = new google.maps.places.Autocomplete(element, {});
        //     self.autocomplete.addListener("place_changed", self.handlePlaceSelect);
        // }, 1000);

        // getJobberType()
        // .then(({result: {data}}) => {
        //     this.setState({jobber_types: data.job_types});
        //     let jobberTypeOptions = [];
        //     if(data.job_types.length > 0){
        //         data.job_types.map((item) => {
        //             let option = {
        //                 label: item.type,
        //                 value: item.type
        //             }
        //             jobberTypeOptions.push(option);
        //         })
        //     }
        //     this.setState({jobberTypeOptions});
        // })

        getUser(user_id)
        .then(({result: {data}}) => {
            this.setState({
                user: data.user,
                avatar: data.user.avatar
            })
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });

        getFeedbacks({user_id, limit, lastValue})
        .then(({result: {data}}) => {
            const {feedbacks} = data;
            this.setState({feedbacks});
        });
    }

    // TODO:SREDI TITLOVE PO SVIM PAGEVIMA
    validate() {
        const { user: { first_name, last_name, address, description } } = this.state;
        const errors = {};

        if (validation.isEmpty(first_name)) {
            errors.title = 'Please provide a first name';
        }
        if (validation.isEmpty(last_name)) {
            errors.price = 'Please provide a last name';
        }
        if (validation.isEmpty(address)) {
            errors.price = 'Please provide a address';
        }
        if (validation.isEmpty(description)) {
            errors.description = 'Please provide a description';
        }

        this.setState({ errors });
        return errors;
    }

    handleInputChange({target: {id, value}}) {
        let {user, query} = this.state;

        user = set(user, id, value);
        query = set(query, id, value);
        this.setState({ user, query });
    }

    onAvatarChange(e) {
        let {user, query} = this.state;
        const avatar = e.target.files[0];

        let reader = new FileReader();
        reader.onloadend = (el) => {
            set(user, "avatar", avatar)
            set(query, "avatar", avatar)
            this.setState({
                user, query,
                avatar: el.target.result
            })
        }

        reader.readAsDataURL(avatar);
    }

    handleRemoveSkill(item) {
        let {user, query} = this.state;
        let categories = user.categories.filter(function(el) {
            if(el.sub !== item.sub)
                return true;
            return false;
        });
        user.categories = categories;
        query.categories = categories;
        this.setState({user, query})
    }

    handleAddSkill() {
        this.setState({isOpen: true})
    }

    toggleAvailability(checked) {
        let {user, query} = this.state;
        user.availability = checked;
        query.availability = checked;
        this.setState({user, query});
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

    selectCategory(item) {
        let {user, query} = this.state;
        const categoryId = user.categories?.findIndex(el=>el.sub === item.sub);
        if(!categoryId || categoryId < 0){
            if (user.categories == null) {
                user.categories = [];
            }
            user.categories.push(item);
            query.categories = user.categories;
            this.setState({user, isOpen:false});
        }else {
            toast.warn(messages.SKILL_IS_EXIST);
        }
    }

    selectJobberType(item) {
        let {user, query} = this.state;
        user.jobber_type = item.value;
        query.jobber_type = item.value;
        this.setState({user, query});
    }

    handleClick(ev) {
        const {history: {push}, favoriteJobber, createSuperUser, createKeyJobber, cancelSuperUser, cancelKeyJobber, createChat, match: {params}} = this.props;
        let {user, query, isShowKeyHirer, isUpdatingKey} = this.state;

        if(ev.target.id === 'profile_edit')
            this.setState({isEdit: !this.state.isEdit});
        else if(ev.target.id === 'profile_chat'){
            // const chat_room_title = user.first_name + " " + user.last_name;
            const user_ids = [this.authUser.id, params.id];
            createChat({ user_ids, type: 'direct', title: null })
            .then(({result: { data }}) => {
                const archivedParam = data.isArchived?'&archive=true':'';
                push(`${paths.client.APP_MESSAGES}?roomId=${data.room.id + archivedParam}`);
            }).catch(({response: {data}}) => {
                toast.error(messages.CHAT_ROOM_FAILED);
            })
        }else if(ev.target.id === 'profile_flash') {
            // createChat({ user_ids:, title, job_id, type, message })
        }else if(ev.target.id === 'profile_favorite') {
            user.is_favorite = !user.is_favorite;
            favoriteJobber({to_user_id: user.id, is_favorite: user.is_favorite});
            this.setState({user});
        }else if(ev.target.id === 'purchase_key' && isUpdatingKey === false) {
            this.setState({isUpdatingKey: true})
            if(isShowKeyHirer) {
                if(user.is_super) {
                    createSuperUser()
                    .then(() => {
                        query.is_super = true;
                        this.setState({
                            query, isConfirmDlg: false,
                            isUpdatingKey: false
                        })
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
                        })
                    }).catch(() => {
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                        user.is_super = true;
                        this.setState({user, isUpdatingKey: false})
                    })
                }
            }else {
                if(user.is_key_jobber) {
                    createKeyJobber()
                    .then(() => {
                        query.is_key_jobber = true;
                        this.setState({
                            query, isConfirmDlg: false,
                            isUpdatingKey: false
                        })
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
                        })
                    }).catch(() => {
                        toast.error(messages.INTERNAL_SERVER_ERROR);
                        user.is_key_jobber = true;
                        this.setState({user, isUpdatingKey: false})
                    })
                }
            }
        }
    }

    handleCancel(ev){
        const {getUser, match: {params}} = this.props;
        ev.preventDefault();
        let user_id = null;
        if(params && params.id)
            user_id = params.id;
        else 
            user_id = this.authUser.id;
        getUser(user_id)
        .then(({result: {data}}) => {
            this.setState({
                user: data.user,
                query: {},
                avatar: data.user.avatar,
                isEdit: false
            })
        })
    }

    handleSubmit(ev) {
        let {user, query} = this.state;
        const { updateUser } = this.props;
        ev.preventDefault();
        this.formRef.classList.add('was-validated');
        if (this.formRef.checkValidity()) {
            if(query.categories)
                query.categories = JSON.stringify(query.categories);
            if(query.location)
                query.location = JSON.stringify(query.location);
            updateUser(user.id, query)
            .then(() => {
                toast.success("Success");

                const userData = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
                for (const [key, value] of Object.entries(query)) {
                    userData[key] = value;
                }
                localStorage.setItem(constant.LOGGED_ACCOUNT, JSON.stringify(userData));
                
                this.setState({isEdit: false})
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
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

    handleChangeDate = (id, date) => {
        let {user, query} = this.state;
        user = set(user, id, date.toString());
        query = set(query, id, date);
        this.setState({ user, query })
    }

    setJobberType = (opt) => {
        let {user, query} = this.state;
        user.jobber_type = opt.value;
        query = set(query, 'jobber_type', opt.value);
        this.setState({user, query});
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
        TimeAgo.addLocale(en)
        const timeAgo = new TimeAgo('en-US');
        const { user: {first_name, company, last_name,location,experience_from,availability,jobber_type,review, is_super, is_key_jobber,
                    description,categories, experience_years,experience_months}, avatar, feedbacks, isEdit, isOpen, isJobber } = this.state;
        let skillBody = null;
        if(categories){
            skillBody = categories.map((item, key)=>{
                return (
                    <div className="category-item" key={key}>{item.sub}
                        {isEdit?<span class="fa fa-close remove-skill-icon" onClick={()=>this.handleRemoveSkill(item)}></span>:null}
                    </div>
                )
            })
        }

        const jobberTypeOption = this.jobberTypeOptions.find(el=>el.value === jobber_type);

        const successRate = review && review.number_of_feedback > 0?(((review.number_of_success?review.number_of_success:0)/review.number_of_feedback)*100):0;
        const searchOptions = {
            componentRestrictions: { country: ['au'] }
        }
        
        return (
            <div className="user-profile-card">
                {this.renderConfirmDialog()}
                <form ref={ref => this.formRef = ref} onSubmit={this.handleSubmit} noValidate>
                    <div className="card">
                        <SkillSelect isOpen={isOpen} handleClose={() => this.setState({isOpen: false})} selectCategory={this.selectCategory}/>
                        <div className="card-body">
                            <div className="header">
                                <div className="center-wrapper">
                                    <ImageUpload
                                        avatar={avatar}
                                        name="avatar"
                                        onChange={this.onAvatarChange}
                                        disabled={isJobber || !isEdit}
                                    />
                                    <div className="user-info">
                                        <div className="user-info-item">
                                            <span>First Name</span>
                                            <div className={`editable-field ${isEdit ? 'edit-mode' : 'read-mode'} first-type`}>
                                                <div className="price hide-on-edit">
                                                    <span className="static-field">{first_name}</span>
                                                </div>
                                                <input type="text" className="form-control dark-input sm-input show-on-edit input-field" placeholder="First Name" value={first_name} id="first_name" onChange={this.handleInputChange} required/>
                                            </div>
                                        </div>
                                        <div className="user-info-item">
                                            <span>Last Name</span>
                                            <div className={`editable-field ${isEdit ? 'edit-mode' : 'read-mode'} first-type`}>
                                                <div className="price hide-on-edit">
                                                    <span className="static-field">{last_name}</span>
                                                </div>
                                                <input type="text" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Last Name" value={last_name} id="last_name" onChange={this.handleInputChange} required/>
                                            </div>
                                        </div>
                                        <div className="user-info-item">
                                            <span>Lives In</span>
                                            <div className={`editable-field ${isEdit ? 'edit-mode' : 'read-mode'} first-type`}>
                                                <div className="price hide-on-edit">
                                                    {/* <span className="static-field">{location?location.address:null}</span> */}
                                                    <span className="static-field">{location?location.address:""}</span>
                                                </div>
                                                {/* <input id="autocomplete" type="text" ref="input" value={location?location.address:null} className="form-control dark-input sm-input show-on-edit input-field" placeholder="Enter Location" /> */}
                                                {/* <input type="text" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Enter Location" value={location?location.address:null} id="location" onChange={this.handleInputChange} required/> */}
                                                <PlacesAutocomplete
                                                    value={location?location.address:""}
                                                    onChange={this.handlePlaceChange}
                                                    onSelect={this.handlePlaceSelect}
                                                    searchOptions={searchOptions}
                                                >
                                                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                                    <div>
                                                        <input
                                                        {...getInputProps({
                                                            placeholder: 'Enter Location',
                                                            className: 'form-control dark-input sm-input show-on-edit input-field'
                                                        })}
                                                        />
                                                        {suggestions.length>0?<div className="autocomplete-dropdown-container">
                                                            {loading && <div>Loading...</div>}
                                                            {suggestions.map(suggestion => {
                                                                const className = suggestion.active
                                                                ? 'suggestion-item--active'
                                                                : 'suggestion-item';
                                                                // inline style for demonstration purpose
                                                                const style = suggestion.active
                                                                ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                                                : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                                                return (
                                                                <div
                                                                    {...getSuggestionItemProps(suggestion, {
                                                                    className,
                                                                    style,
                                                                    })}
                                                                >
                                                                    <span>{suggestion.description}</span>
                                                                </div>
                                                                );
                                                            })}
                                                        </div>:null}
                                                    </div>
                                                    )}
                                                </PlacesAutocomplete>
                                            </div>
                                        </div>
                                        <div className="user-info-item">
                                            <span>Experience</span>
                                            <div className={`editable-field ${isEdit ? 'edit-mode' : 'read-mode'} first-type`}>
                                                <div className="price hide-on-edit">
                                                    <span className="static-field">{experience_years? experience_years : 0} years, {experience_months? experience_months : 0} months</span>
                                                </div>
                                                {/* <DateInputPicker className="date-picker dark-input sm-input show-on-edit input-field" showIcon={false} id="experience_from" value={experience_from?(new Date(experience_from)):null} isArrow={false} onChange={this.handleChangeDate}></DateInputPicker> */}
                                                {/* <input type="date" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Experience From" value={experience_from?experience_from:""} id="experience_from" onChange={this.handleInputChange}/> */}
                                                <div style={{display: "flex"}}>
                                                    <input id="experience_years" min="0" style={{width: "100px", marginRight: "10px"}} type="number" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Years" value={experience_years} onChange={this.handleInputChange}/>
                                                    <input id="experience_months" min="0" max="12" style={{width: "100px"}} type="number" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Months" value={experience_months} onChange={this.handleInputChange}/>
                                                </div>        
                                            </div>
                                        </div>
                                        
                                        <div className="user-info-item">
                                            <span>Company</span>
                                            <div className={`editable-field ${isEdit ? 'edit-mode' : 'read-mode'} first-type`}>
                                                <div className="price hide-on-edit">
                                                    <span className="static-field">{company && company.length > 10 ? company.substring(0, 10) + "...":company}</span>
                                                </div>
                                                <input type="text" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Company" value={company} id="company" onChange={this.handleInputChange}/>
                                                {/* <input type="date" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Experience From" value={experience_from?experience_from:""} id="experience_from" onChange={this.handleInputChange}/> */}
                                            </div>
                                        </div>
                                        <div className="user-info-item">
                                            <span>Profile Visibility</span>
                                            {!isEdit?<span>{availability?"Show Profile":"Hide Profile"}</span>:
                                            <Switch checked={availability} name="availability" onChange={this.toggleAvailability}></Switch>}
                                        </div>
                                        {!isEdit?<div className="user-info-item">
                                            <Score score={review?review.score:0} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"} size={"25px"} />
                                        </div>:null}
                                    </div>
                                    {this.renderAction()}
                                </div>
                            </div>
                            {!isEdit?<div className="user-job-rate">
                                <div className="rate-detail rate-completed">
                                    <div className="rate-value">
                                        {review?review.number_of_completed:0}
                                    </div>
                                    <div className="rate-description">
                                        {"Jobs Completed"}
                                    </div>
                                </div>
                                <div className="rate-detail rate-success">
                                    <div className="rate-value">
                                        {(successRate?(successRate % 1 === 0?successRate:successRate.toFixed(2)):0) + "%"}
                                    </div>
                                    <div className="rate-description">
                                        {"Success rate"}
                                    </div>
                                </div>
                            </div>:null}
                            <div className="divder-line mt-3"></div>

                            <div className="user-skills">
                                <div className="user-detail-title">{"Skills"}</div>
                                {skillBody}{isEdit?<div className="category-item"><span class="fa fa-plus" onClick={this.handleAddSkill}></span></div>:null}
                            </div>
                            <div className="divder-line mt-3"></div>

                            {isEdit?<div className="user-description">
                                <div className="user-detail-title">{"Type"}</div>
                                <Select 
                                    styles={customStyles}
                                    name="filters"
                                    placeholder="Please select jobber type"
                                    value={this.jobberTypeOptions.find(el=>el.value === jobber_type)}
                                    options={this.jobberTypeOptions}
                                    onChange={this.selectJobberType}
                                />
                            </div>:null}
                            {/* {isEdit?<div className="user-description d-flex">
                                <div className="left-wrapper">Super User</div>
                                <div className="right-wrapper"><Switch checked={is_key_hirer} name="isKeyHirer" onChange={this.toggleKeyHirer}></Switch></div>
                            </div>:null} */}
                            {/* {isEdit?<div className="user-description d-flex">
                                <div className="left-wrapper">I am a Super User</div>
                                <div className="right-wrapper"><Switch checked={is_super} name="isKeyJobber" onChange={this.toggleSuper}></Switch></div>
                            </div>:null} */}
                            {/* {isEdit?<div className="user-description d-flex">
                                <div className="left-wrapper">I'm a Key Jobber</div>
                                <div className="right-wrapper"><Switch checked={is_key_jobber} name="isKeyJobber" onChange={this.toggleKeyJobber}></Switch></div>
                            </div>:null} */}
                            {!isEdit?<div className="user-reviews">
                                <div className="user-detail-title">{"Review"}</div>
                                {
                                    feedbacks.length > 0?
                                    feedbacks.map((feedback, key) => (
                                        <div className="row">
                                            <div className="col-12 d-flex flex-column">
                                                <Score score={feedback.score} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"} size={"25px"} />
                                                <span className="static-field">{feedback.comment?feedback.comment:"No comment"}</span>
                                            </div>
                                        </div>
                                    )):"No Review"
                                }
                            </div>:null}
                        </div>
                    </div>
                    {isEdit?
                    <div className="footer">
                        <button className="btn btn-outline-success mr-3" id="cancel_but" onClick={this.handleCancel}>Cancel</button>
                        <button type="submit" className="btn btn-success" id="save_but">Save</button>
                    </div>:null}
                </form>
            </div>
        )
    }
}

Profile.propTypes = {
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
)(Profile);
