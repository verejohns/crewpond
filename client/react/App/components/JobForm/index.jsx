import React, { Component } from "react";
import PropTypes from "prop-types";
import { set, isEmpty } from 'lodash';
import { time, messages } from '../../../../../utils';
import moment from 'moment';

import PlacesAutocomplete, { geocodeByAddress,
    geocodeByPlaceId,
    getLatLng } from 'react-places-autocomplete'
import { EditableField, ImageUpload, Select, Switch, FormError } from "../../../components";
import {ConfirmDialog} from "../";
import { Modal, ModalBody } from 'reactstrap';
import GoogleMapReact from 'google-map-react';
const AnyReactComponent = () => <span class="fa fa-map-marker" aria-hidden="true"></span>;

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: '1 !important',
        borderRadius: 20,
     })
  }

  const initialState = {
    submitIsClicked: false,
    schedules: [],
    categories: [],
    isOpenMap: false,
    address: '',
    latitude: -33.865143,
    longitude: 151.209900,
    defaultZoom: 11,
    location: {value: "remote", label: "Remote"},
    isConfirmModal: false,
    user_location: JSON.parse(localStorage.getItem('user_location')),
    changed: false
  };

  const getMapBounds = (map, maps) => {
    const bounds = new maps.LatLngBounds();

    return bounds;
  };

  // Re-center map when resizing the window
  const bindResizeListener = (map, maps, bounds) => {
    maps.event.addDomListenerOnce(map, 'idle', () => {
      maps.event.addDomListener(window, 'resize', () => {
        map.fitBounds(bounds);
      });
    });
  };

  // Fit map to its bounds after the api is loaded
  const apiIsLoaded = (map, maps) => {
    // Get bounds by our places
    const bounds = getMapBounds(map, maps);
    // Fit map to bounds
    map.fitBounds(bounds);
    // Bind the resize listener
    bindResizeListener(map, maps, bounds);
  };

import Geocode from "react-geocode";

Geocode.setApiKey(process.env.GOOGLE_API_KEY);
Geocode.setRegion("au");
Geocode.setLocationType("ROOFTOP");

class JobForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
        };
        // this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.selectCategory = this.selectCategory.bind(this);
        this.togglePublic = this.togglePublic.bind(this);
        this.toggleSOSJob = this.toggleSOSJob.bind(this);
        this.setHourly = this.setHourly.bind(this);
        this.setLocation = this.setLocation.bind(this);
        this.onAvatarChange = this.onAvatarChange.bind(this);
    }

    componentDidMount() {
        const { user_location } = this.state;
        if (user_location != null) {
            this.setState({
                address: user_location.address,
                latitude: user_location.latitude,
                longitude: user_location.longitude
            });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                Geocode.fromLatLng(position.coords.latitude, position.coords.longitude).then(
                    (response) => {
                        const new_address = response.results[0].formatted_address;
                        const new_place_name = new_address.split(",")[0];

                        const new_location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            address: new_address,
                            place_name: new_place_name
                        }
                        this.setState({
                            address: new_location.address,
                            latitude: new_location.latitude,
                            longitude: new_location.longitude
                        });
                        localStorage.setItem('user_location', JSON.stringify(new_location));
                    },
                    (error) => {
                      console.error(error);
                    }
                  );
            });
        }
    }

    handleChange = (address) => {
        this.setState({ address });
    };

    handleSelect = (address) => {
        geocodeByAddress(address)
        .then(results => getLatLng(results[0]))
        .then(latLng => {
            let place_name = address.split(',')[0];
            this.setState({
                address,
                longitude: latLng.lng,
                latitude: latLng.lat,
                place_name,
                changed: true
            });
            
        }).catch(error => console.error('Error', error));
    };

    setHourly(opt) {
        const { onChange } = this.props;
        let { data } = this.props;
        if(opt.value === "fixed") {
            set(data, "is_hourly", false);
        }else{
            set(data, "is_hourly", true);
        }
        onChange(data);
    }

    setLocation(opt) {
        const { onChange } = this.props;
        let { data } = this.props
        const { address, latitude, longitude, place_name } = this.state;
        if(opt.value === "remote") {
            set(data, "location", {address: null, latitude: null, longitude: null, place_name: null});
            onChange(data);
        }else if(opt.value === "australia"){
            this.setState({isOpenMap: true});
        }else if(opt.value === "custom") {
            set(data, "location", {address, latitude, longitude, place_name});
            this.setState({isOpenMap: false});
            onChange(data);
        }
        this.setState({location: opt});

    }

    selectCategory(opt) {
        const { onChange } = this.props;
        let { data } = this.props;
        const category = {main: opt.value.main, sub: opt.value.content, reveal: opt.value.reveal};

        set(data, "category", category);
        onChange(data);
    }

    handleInputChange({target: {id, value}}) {
        const { onChange } = this.props;
        let { data, schedules } = this.props;

        if(id === 'due_date') {
            if(schedules.length > 0) {
                let endSchedule = value;
                for(let i = 0; i < schedules.length; i += 1) {
                    for(let j = 0; j < schedules[i].time_field.length; j += 1) {
                        if(time.compareDate(endSchedule, schedules[i].time_field[j].to)) {
                            endSchedule = schedules[i].time_field[j].to;
                        }
                    }
                }

                if(time.compareDate(value, endSchedule)){
                    data.due_date = endSchedule;
                    
                }else {
                    data.due_date = value;
                }
            }else {
                data.due_date = value;
            }
        }else
            data = set(data, id, value);
        onChange(data);
    }

    togglePublic(checked) {
        const { onChange } = this.props;
        let { data } = this.props;

        data = set(data, 'is_public', !checked);
        onChange(data);
    }

    toggleSOSJob(checked) {
        if(checked) {
            this.setState({isConfirmModal: true});
        }else {
            const { onChange } = this.props;
            let { data } = this.props;

            data = set(data, 'is_urgent', checked);
            this.setState({isConfirmModal: false})
            onChange(data);
        }
    }


    onAvatarChange (e) {
        const { onChange } = this.props;
        let { data } = this.props;
        const mediaFile = e.target.files[0];

        set(data, "avatar", mediaFile)
        onChange(data);
    }

    handleOK = () => {
        const { onChange } = this.props;
        let { data } = this.props;

        data = set(data, 'is_urgent', true);
        this.setState({isConfirmModal: false})
        onChange(data);
    }

    handleCancel = () => {
        this.setState({isConfirmModal: false});
    }

    renderMapModal() {
        const { address, defaultZoom, latitude, longitude, isOpenMap, changed } = this.state;
        const { data } = this.props;
        const searchOptions = {
            componentRestrictions: { country: ['au'] }
        }
        return (
            <Modal isOpen={isOpenMap} className="map-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isOpenMap: false})}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Select Location</h5>
                    <PlacesAutocomplete
                        value={address !== '' ? address : data.location && data.location.address != '' ? data.location.address : ''}
                        onChange={this.handleChange}
                        onSelect={this.handleSelect}
                        searchOptions={searchOptions}
                    >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div>
                            <input
                            {...getInputProps({
                                placeholder: 'Search Places ...',
                                className: 'location-search-input form-control ',
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
                    <div className="map-container mt-3">
                        <GoogleMapReact
                            apiKey={process.env.GOOGLE_API_KEY}
                            center={[changed ? latitude : data.location && data.location.latitude ? data.location.latitude : latitude, changed ? longitude : data.location && data.location.longitude ? data.location.longitude : longitude]}
                            zoom={defaultZoom}
                            // yesIWantToUseGoogleMapApiInternals
                            // onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps)}

                        >
                            <AnyReactComponent
                                lat={changed ? latitude : data.location && data.location.latitude ? data.location.latitude : latitude}
                                lng={changed ? longitude : data.location && data.location.longitude ? data.location.longitude : longitude}
                            />
                        </GoogleMapReact>
                    </div>
                    <div className="footer">
                        <button className="btn btn-outline-success" onClick={() => this.setState({isOpenMap: false})}>Cancel</button>
                        <button className="btn btn-success" onClick={() => this.setLocation({label: address, value: 'custom' })}>OK</button>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    render() {
        const { onAddSchedule, onEditSchedule, onDeleteSchedule, isEdit, errors, submmitClicked, data, avatar, categories, schedules } = this.props;
        const { location, isConfirmModal } = this.state;
        let category = null;
        if(categories.length > 0 && !isEmpty(data.category)){
            if (Array.isArray(data.category)) {
                const mainCategory = categories.find(el=>el.label === data.category[0].main);
                category = mainCategory.options.find(el=>el.label === data.category[0].sub);
            } else {
                const mainCategory = categories.find(el=>el.label === data.category.main);
                category = mainCategory.options.find(el=>el.label === data.category.sub);
            }
            
        }
        
        return (
            <form className="job-form">
                {this.renderMapModal()}
                <ConfirmDialog isOpen={isConfirmModal} title={"SOS Urgent staff"} description={messages.SOS_URGENT_CONFIRM} ok="Agree" cancel="Disagree" onOk={this.handleOK} onCancel={this.handleCancel}></ConfirmDialog>

                <div className="header">
                    <ImageUpload
                        avatar={avatar}
                        name="image"
                        type="job"
                        onChange={this.onAvatarChange}
                    />

                    <div className="primary-info">
                        <div className="info-item">
                            <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                            <EditableField type="1" isEdit={true}>
                                <div className="price hide-on-edit">
                                    <span className="static-field">{data.price}</span>
                                    <span> $</span>
                                </div>
                                <input type="number" className="form-control dark-input sm-input show-on-edit input-field" placeholder="Price" value={data.price} id="price" onChange={this.handleInputChange}/>
                                <FormError show={submmitClicked} error={errors.price} />
                            </EditableField>
                        </div>
                        <div className="info-item">
                            <img src="/static/images/icons/icon-hourglass-green.svg" alt="" />
                            <Select
                                options={[{value: "hourly", label: "Hourly"}, {value: "fixed", label: "Fixed"}]}
                                name="type"
                                defaultValue={[{value: "hourly", label: "Hourly"}]}
                                dark
                                small
                                onChange={this.setHourly}
                            />
                        </div>
                        <div className="info-item">
                            <img src="/static/images/icons/icon-location-green.svg" alt="" />
                            <Select
                                options={[{value: "remote", label: "Remote"}, {value: "australia", label: "Australia"}]}
                                name="type"
                                value={data.location && data.location.address?{label: data.location.address, value: 'custom'}:location}
                                dark
                                small
                                onChange={this.setLocation}
                            />
                            {/*  */}
                        </div>
                        <div className="info-item">
                            <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                            <input id="due_date" type="date" ref="input" value={data.due_date? moment(data.due_date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')} className="dark-input sm-input show-on-edit input-field form-control" placeholder="Due Date" onChange={this.handleInputChange} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 mb-4">
                        <EditableField type="2">
                            <div className="section-header">
                                <h4>Category</h4>
                            </div>
                            <Select
                                customClassName="select-skill"
                                styles={customStyles}
                                name="filters"
                                placeholder="Select a category"
                                value={category}
                                options={categories}
                                onChange={this.selectCategory}
                                dark
                            />
                            <FormError show={submmitClicked} error={errors.category} />
                        </EditableField>
                    </div>
                    <div className="col-12 mb-4">
                        <div className='editable-field edit-mode first-type'>
                            <div className="section-header">
                                <h4>Job Title</h4>
                            </div>
                            <input type="text" className="form-control show-on-edit input-field" value={data.title} id="title" onChange={this.handleInputChange}/>
                            <FormError show={submmitClicked} error={errors.title} />
                        </div>
                    </div>
                    <div className="col-12 mb-5">
                        <div className='editable-field edit-mode first-type'>
                            <div className="section-header">
                                <h4>Job Description</h4>
                                <div className="action" />
                            </div>
                            <div className="textarea-container">
                                <textarea className="form-control show-on-edit input-field" rows={6} value={data.description} id="description" onChange={this.handleInputChange}/>
                            </div>
                            <FormError show={submmitClicked} error={errors.description} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 mb-4">
                        <div className="section-header">
                            <h4>Schedules</h4>

                            <div className="editable-field second-type">
                                <div className="action" onClick={onAddSchedule}>
                                    <img src="/static/images/icons/icon-new-green.svg" alt="" />
                                </div>
                            </div>
                        </div>

                        {/* TODO: update to use component */}
                        <div className="schedule-list">
                            {schedules?schedules.map((schedule, key) => {
                                const time_field = schedule.time_field;
                                return (
                                    <div className="schedule">
                                        <div className="indicator">
                                            <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                                        </div>
                                        <div className="content">
                                            <div className="top">
                                                <span className="name">{schedule.name}</span>
                                            </div>
                                            
                                            <div className="bottom">
                                                {time_field[0] && 
                                                <div className="d-flex flex-column">
                                                    <span className="date">{time_field[0].from && moment(time_field[0].from).format('DD MMM YY')} - {time_field[time_field.length-1].to && moment(time_field[time_field.length-1].to).format('DD MMM YY')}</span>
                                                    <span className="date">{time_field[0].from && moment(time_field[0].from).format('hh:mm A')} - {time_field[time_field.length-1].to && moment(time_field[time_field.length-1].to).format('hh:mm A')}</span>
                                                </div>}
                                                <div className="schedule-action">
                                                    <span onClick={() => onDeleteSchedule(schedule, key)}>Remove</span>
                                                    <span onClick={() => onEditSchedule(schedule, key)}>Edit</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }):null}
                        </div>
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="col-md-11">
                        <h4>SOS <span className="font-weight-light">Urgent Staff</span></h4>
                    </div>
                    <div className="col-md-1">
                        <Switch checked={data.is_urgent} name="isUrgent" onChange={this.toggleSOSJob}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-11">
                        <h4>Private</h4>
                    </div>
                    <div className="col-md-1">
                        <Switch checked={!data.is_public} name="isPrivate" onChange={this.togglePublic}/>
                    </div>
                </div>
            </form>
        );
    }
}

JobForm.propTypes = {
    data: PropTypes.object,
    avatar: PropTypes.string,
    errors: PropTypes.object,
    schedules: PropTypes.array,
    categories: PropTypes.array,
    onChange: PropTypes.func,
    onEditSchedule: PropTypes.func,
    onDeleteSchedule: PropTypes.func,
    onAddSchedule: PropTypes.func,
    isEdit: PropTypes.bool,
    submmitClicked: PropTypes.bool,
};

export default JobForm;
