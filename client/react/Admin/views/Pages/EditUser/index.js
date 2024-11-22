import React, { Component } from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import selectors from './selectors';
import actions from '../../../actions';
import moment from 'moment';
import md5 from 'md5';
import { withRouter } from 'react-router-dom';
import { inYears, inMonths, inHours } from '../../../../../../utils/time';
import { validation } from '../../../../../../utils';
import { set, isEmpty, merge } from 'lodash';

import Select from 'react-select';
import { Card, CardBody} from 'reactstrap';
import { Select as CustomSelect, Switch, ImageUpload, EditableField} from "../../../components";
import { ToastContainer, toast } from 'react-toastify';
import { Loader, Score} from "../../../../components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: '1 !important',
        borderRadius: 20,
     })
  }

class EditUser extends Component {
    constructor() {
        super();
        this.state = {
            user: {},
            categoryOptions: [],
            category: null,
            edit_firstname: false,
            edit_lastname: false,
            edit_address: false,
            edit_exp: false,
            edit_description: false,
            query: {},
            address: '',
            categories: null,
            trial_period: [{value: 1, label: "1 Month"}, {value: 3, label: "3 Months"}, {value: 6, label: "6 Months"}, {value: 12, label: "12 Months"}],
            limit: 10,
            lastValue: null,
            feedbacks: [],
            editFeedback: false
        }
        this.autocomplete = null
        this.handlePlaceSelect = this.handlePlaceSelect.bind(this)

        this.toggleSwitch = this.toggleSwitch.bind(this);
        this.toggleKeyHirer = this.toggleKeyHirer.bind(this);
        this.toggleKeyJobber = this.toggleKeyJobber.bind(this);
        this.selectCategory = this.selectCategory.bind(this);
        this.handleRate = this.handleRate.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleRemoveSkill = this.handleRemoveSkill.bind(this);
        this.validate = this.validate.bind(this);
        this.saveProfile = this.saveProfile.bind(this);
        this.cancelProfile = this.cancelProfile.bind(this);
        this.handleExpChange = this.handleExpChange.bind(this);
        this.onAvatarChange = this.onAvatarChange.bind(this);
        this.selectTrialPeriod = this.selectTrialPeriod.bind(this);
        this.handleEditFeedback = this.handleEditFeedback.bind(this);
        this.handleEditComment = this.handleEditComment.bind(this);
    }

    componentDidMount() {
        const { getUser, getCategories, getFeedbacks, match: {params: {id}} } = this.props;
        const { limit, lastValue } = this.state;
        const self = this;
        setTimeout(function(){ 
            const element = document.getElementById('address');
            self.autocomplete = new google.maps.places.Autocomplete(element, {})
    
            self.autocomplete.addListener("place_changed", self.handlePlaceSelect)
                
        }, 1000);

        getFeedbacks({user_id: id, limit, lastValue})
        .then(({result: {data}}) => {
            const {feedbacks} = data;
            this.setState({feedbacks});
        });
        getUser(id)
        getCategories()
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isUserLoaded && JSON.stringify(this.state.user) !== JSON.stringify(nextProps.user)){
            this.setState({
                user: nextProps.user,
                avatar: nextProps.user.avatar
            })
        }

        if(nextProps.isCategoriesLoaded && JSON.stringify(this.state.categories) !== JSON.stringify(nextProps.categories)) {
            const categories = nextProps.categories;
            this.setState({
                categories: nextProps.categories
            })
            let categoryOptions = []
            if(categories.length > 0){
                categories.map((category) => {
                    let option = {
                        label: category.main,
                    }

                    let subOptions = []
                    const subCategories = category.sub;
                    for(let i = 0; i < subCategories.length; i += 1){
                        subOptions.push({
                            label: subCategories[i],
                            value: {id: i, content: subCategories[i], main: category.main},
                        });
                    }

                    option.options = subOptions;
                    categoryOptions.push(option);
                })
            }
            this.setState({
                categoryOptions: categoryOptions
            })
        }
    }

    handleEditFeedback () {
        const {updateFeedbackByUser, match: {params: {id}} } = this.props;
        const {feedbacks} = this.state;
        if(this.state.editFeedback) {
            updateFeedbackByUser(id, feedbacks);
        }
        this.setState({editFeedback: !this.state.editFeedback});
    }

    handleRate (rating, key) {
        let {feedbacks} = this.state;
        feedbacks[key].score = rating;
        this.setState({feedbacks});
    }

    handleEditComment(event, key) {
        let {feedbacks} = this.state;
        feedbacks[key].comment = event.target.value;
        this.setState({feedbacks});
    }

    handlePlaceSelect() {
        let addressObject = this.autocomplete.getPlace()
        let {query, user} = this.state;

        let address = addressObject.address_components;
        let location = {};

        location.address = addressObject.name;
        location.place_name = address?`${address[0]?address[0].long_name:""} ${address[1]?address[1].long_name:''}`:""
        location.latitude = addressObject.geometry.location.lat();
        location.longitude = addressObject.geometry.location.lng();

        set(user, 'location', location);

        query.location = JSON.stringify(user.location);
        this.setState({user, query});
    }    

    selectTrialPeriod(opt) {
        let { user, query } = this.state;
        set(user, 'trial_period', opt.value);
        merge(query, {
            trial_period: user.trial_period
        });

        this.setState({user, query});
    }

    onAvatarChange (e) {
        let { query } = this.state;
        const mediaFile = e.target.files[0];
        merge(query, {
            file: mediaFile
        });
        this.setState({
            query: query
        })

        let reader = new FileReader();
        reader.onloadend = (el) => {
            this.setState({
                avatar: el.target.result,
            })
        }

        reader.readAsDataURL(mediaFile);
    }

    saveProfile (event) {
        if (event) {
            event.preventDefault();
        }
        
        const { updateUser } = this.props;
        let { user, query, feedbacks } = this.state;
        
        if (feedbacks.length) {
            let feedbacks_query = "";
            for (let i = 0; i < feedbacks.length; i++) {
                feedbacks_query += feedbacks_query === "" ? feedbacks[i].id + ":" + feedbacks[i].comment : "," + feedbacks[i].id + ":" + feedbacks[i].comment;
            }
            
            query.feedbacks = feedbacks_query;
        }

        if(query.password) {
            query.password = (md5(query.password)).toUpperCase();
        }

        if (isEmpty(this.validate())) {
            updateUser(user.id, query)
            .then(() => {
                user.password = null
                this.setState({user});
                toast.success("Success", {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false,
                });
            }).catch(() => {
                user.password = null
                toast.error("Failed", {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false,
                });
            });
        }
    }

    cancelProfile () {

    }

    handleExpChange (selectedDate) {
        let { user, query } = this.state;

        merge(user, {
            experience_from: moment(selectedDate).format('YYYY-MM-DD HH:mm:ssZ')
        })
        merge(query, {
            experience_from: moment(selectedDate).format('YYYY-MM-DD HH:mm:ssZ')
        });

        this.setState({ user, query });
    }

    handleRemoveSkill(category) {
        let { user, query } = this.state;

        const removedCategories = user.categories.filter(el=>el.sub !== category.sub);

        set(user, 'categories', removedCategories);
        merge(query, {
            categories: JSON.stringify(removedCategories)
        });

        this.setState({
            user: user,
            query: query
        });
    }

    validate() {
        const { user: { first_name, last_name, address, experience_from, description } } = this.state;

        const errors = {};

        if (validation.isEmpty(first_name)) {
          errors.first_name= 'Please provide a First Name';
        } else if (!validation.isValidName(first_name)) {
          errors.first_name = 'First Name is invalid';
        }

        if (validation.isEmpty(last_name)) {
          errors.last_name = 'Please provide a Last Name';
        } else if (!validation.isEmpty(last_name)) {
          if (!validation.isValidName(last_name)) {
            errors.last_name = 'Last Name is invalid';
          }
        }
        this.setState({ errors });
        return errors;
    }


    handleEdit(event) {
        let { user, query } = this.state;
        const id = event.target.id;

        set(user, id, event.target.value);
        merge(query, {
            [id]: event.target.value
        })

        this.setState(
            { user, query },
            () => this.validate(),
        );
    }

    toggleSwitch(checked){
        let { user, query } = this.state;
        set(user, 'availability', checked);
        merge(query, {
            availability: checked
        });

        this.setState({
            user: user,
            query: query
        });
    }

    toggleKeyHirer(checked){
        let { user, query } = this.state;
        set(user, 'is_key_hirer', checked);
        merge(query, {
            is_key_hirer: checked
        });

        this.setState({
            user: user,
            query: query
        });
    }

    toggleKeyJobber(checked){
        let { user, query } = this.state;
        merge(query, {
            is_key_jobber: checked
        });

        set(user, 'is_key_jobber', checked);
        this.setState({
            user: user,
            query: query
        });
    }

    selectCategory(opt) {
        let { user, query } = this.state;
        let categories = user.categories?user.categories:[];

        if(!categories.find(el=>el.sub === opt.label)){
            categories.push({sub: opt.value.content, main: opt.value.main});
            set(user, 'categories', categories);
            merge(query, {
                categories: JSON.stringify(categories)
            });
        }

        this.setState({
            category: opt,
            user: user,
            query: query
        });
    }

    getExperience(date) {
        if(date){
            const year = inYears(new Date(date._seconds * 1000), new Date());
            const month = inMonths(new Date(date._seconds * 1000), new Date());
            const day = inHours(new Date(date._seconds * 1000), new Date());

            const expTime = (year === 0?(month === 0?(day === 0?'': (day + " days")): (month + " months")): (year + " years"));
            return expTime;
        }else{
            return ''
        }
    }

    getAddress(location) {
        if(!isEmpty(location)) {
            return location.Address
        }
        return '';
    }

    handleChange = address => {
        this.setState({ address });
    };

    handleSelect = address => {
        geocodeByAddress(address)
          .then(results => getLatLng(results[0]))
          .then(latLng => console.log('Success', latLng))
          .catch(error => console.error('Error', error));
    };

    renderProfileRightView () {
        const { category, categoryOptions, feedbacks, editFeedback, user: { review, categories } } = this.state;

        let skills = null;
        if(categories){
            skills = categories.map((item, key)=>{
                return (
                    <div className="category-item" key={key}>{item.sub}<span className="fa fa-close remove-skill-icon" onClick={()=>this.handleRemoveSkill(item)}></span></div>
                )
            })
        }
        return (
            <Card>
                <CardBody>
                    <div className="row profile-description">
                        <div className="col-md-12">
                            <div className="profile-caption">{"Skills"}</div>
                            <Select
                                className="select-skill"
                                multi
                                styles={customStyles}
                                name="filters"
                                placeholder="Filters"
                                value={category?category.sub:null}
                                options={categoryOptions}
                                onChange={this.selectCategory}
                            />
                            {skills}
                        </div>
                    </div>
                    <div className="row profile-description">
                        <div className="col-md-12">
                            <div className="section-header">
                                <h4>Reviews</h4>
                                <div className="action" onClick={this.handleEditFeedback}>
                                    <img class="show-on-edit" src={editFeedback?"/static/images/icons/icon-edit-gray.svg":"/static/images/icons/icon-edit-green.svg"} alt="" />
                                </div>
                            </div>
                            {
                                feedbacks.map((feedback, key) => (
                                    <div className="row">
                                        <div className="col-4">
                                            <Score score={feedback.score} selectedColor={"#60da8e"} unSelectedColor={"#ABABAB"} size={"25px"} disabled={!editFeedback} onConfirmRate={(rating) => this.handleRate(rating, key)}/>
                                        </div>
                                        <div className="col-4">
                                            {!editFeedback?<span className="static-field">{feedback.comment}</span>:
                                            <input type="text" className="form-control input-field" value={feedback.comment} id="comment" onChange={(event) => this.handleEditComment(event, key)}/>}
                                        </div>
                                        <div className="col-4">
                                            {feedback.from_user.first_name}
                                        </div>
                                    </div>
                                ))
                            }
                            
                        </div>
                    </div>
                </CardBody>
            </Card>
        )
    }

    render() {
        const { isUserLoaded, isCategoriesLoaded } = this.props;
        const { user, avatar, trial_period } = this.state;
        return (
            <div className="animated fadeIn crewpond-profile-view">
                <ToastContainer/>
                {!isUserLoaded || !isCategoriesLoaded?<Loader></Loader>:

                <form className="user-form">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-md-12">
                                    <Card>
                                        <CardBody>  
                                            <div className="row profile-view">
                                                <div className="col-md-2">
                                                    <ImageUpload
                                                        avatar={avatar}
                                                        name="image"
                                                        onChange={this.onAvatarChange}
                                                    />
                                                </div>
                                                <div className="col-md-5">
                                                    <div className="row profile-content">
                                                        <div className="col-md-4"><div className="profile-caption">{"First Name"}</div></div>
                                                        <div className="col-md-6">
                                                            <input type="text" className="form-control lg-input show-on-edit input-field" placeholder="Enter First Name" id="first_name" value={user.first_name} onChange={this.handleEdit}/>
                                                        </div>
                                                        <div className="col-md-2"/>
                                                    </div>
                                                    <div className="row profile-content">
                                                        <div className="col-md-4"><div className="profile-caption">{"Last Name"}</div></div>
                                                        <div className="col-md-6">
                                                            <input type="text" className="form-control lg-input show-on-edit input-field" placeholder="Enter Last Name" id="last_name" value={user.last_name} onChange={this.handleEdit}/>
                                                        </div>
                                                        <div className="col-md-2"/>
                                                    </div>
                                                    <div className="row profile-content">
                                                        <div className="col-md-4"><div className="profile-caption">{"Email"}</div></div>
                                                        <div className="col-md-6">
                                                            <input type="email" className="form-control lg-input show-on-edit input-field" placeholder="Enter Email" id="email" value={user.email} onChange={this.handleEdit}/>
                                                        </div>
                                                        <div className="col-md-2"/>
                                                    </div>
                                                    <div className="row profile-content">
                                                        <div className="col-md-4"><div className="profile-caption">{"Passowrd"}</div></div>
                                                        <div className="col-md-6">
                                                            <input type="password" className="form-control lg-input show-on-edit input-field" placeholder="Enter Password" id="password" value={user.password} onChange={this.handleEdit}/>
                                                        </div>
                                                        <div className="col-md-2"/>
                                                    </div>
                                                </div>
                                                <div className="col-md-5">
                                                    <div className="row profile-content">
                                                        <div className="col-md-4"><div className="profile-caption">{"Location"}</div></div>
                                                        <div className="col-md-6">
                                                            <input id="address" type="text" ref="input" className="form-control lg-input show-on-edit input-field" placeholder="Enter Location" value={user.location?user.location.address:""}/>
                                                        </div>
                                                        <div className="col-md-2"/>
                                                    </div>
                                                    <div className="row profile-content">
                                                        <div className="col-md-4"><div className="profile-caption">{"Experience"}</div></div>
                                                        <div className="col-md-6">
                                                            <DatePicker
                                                                dateFormat="MM/dd/yyyy"
                                                                className="form-control lg-input show-on-edit input-field"
                                                                selected={user.experience_from?new Date(user.experience_from):null}
                                                                onChange={this.handleExpChange}
                                                            />
                                                        </div>
                                                        <div className="col-md-2"/>
                                                    </div>
                                                    <div className="row profile-content">
                                                        <div className="col-4"><div className="profile-caption">{"Available"}</div></div>
                                                        <div className="col-8 user-availability" ><Switch onChange={this.toggleSwitch} checked={user.availability}/></div>
                                                    </div>
                                                    <div className="row profile-content">
                                                        <div className="col-md-4"><div className="profile-caption">{"Free Period"}</div></div>
                                                        <div className="col-md-6">
                                                            <div className="trial-period-item">
                                                                <CustomSelect
                                                                    options={trial_period}
                                                                    name="type"
                                                                    value={user.trial_period?trial_period.find(el=>el.value==user.trial_period):1}
                                                                    dark
                                                                    small
                                                                    onChange={this.selectTrialPeriod}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2"/>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-12 mb-5">
                                                    <div className="section-header">
                                                        <h4>Description</h4>
                                                    </div>
                                                    <textarea className="form-control show-on-edit input-field" rows={6} defaultValue={user.description} value={user.description} id="description" onChange={this.handleEdit}/>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="profile-description">{"Type"}</div>
                                                    <div className="row profile-desc-content">
                                                        <div className="col-sm-12 col-md-3">
                                                            <div className="profile-key-type">
                                                                <div className="profile-key-caption">{"Key Hirer"}</div>
                                                                <Switch onChange={this.toggleKeyHirer} checked={user.is_key_hirer}/>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-12 col-md-3">
                                                            <div className="profile-key-type">
                                                                <div className="profile-key-caption">{"Key Jobber"}</div>
                                                                <Switch onChange={this.toggleKeyJobber} checked={user.is_key_jobber}/>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-12 col-md-6">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                            <div className="crew-fill-button save-button" onClick={this.saveProfile}>{"Save"}</div>
                            <div className="crew-outline-button cancel-button" onClick={this.cancelProfile}>{"Cancel"}</div>
                        </div>
                        <div className="col-md-4">
                            {this.renderProfileRightView()}
                        </div>
                    </div>
                </form>}
            </div>
        );
    }
}

EditUser.defaultProps = {
    categories: []
};

EditUser.propTypes = {
    getUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    isUserLoaded: PropTypes.bool.isRequired,
    user: PropTypes.object,
    getCategories: PropTypes.func.isRequired,
    getFeedbacks: PropTypes.func.isRequired,
    updateFeedbackByUser: PropTypes.func.isRequired,
    isCategoriesLoaded: PropTypes.bool.isRequired,
    categories: PropTypes.array,
    isUpdatingUser: PropTypes.bool.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
};


export default connect(
    selectors,
    {
        ...actions.users,
        ...actions.category,
        ...actions.feedbacks
    },
)(withRouter(EditUser));
