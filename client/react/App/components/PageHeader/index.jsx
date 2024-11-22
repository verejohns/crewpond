import React, { Component } from "react";
import { withRouter, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ReactSelect from 'react-select';
import moment from 'moment';
import PropTypes from 'prop-types';

import { Loader, Select, DateInputPicker } from '../../../components';
import { paths, messages, constant } from '../../../../../utils';
import selectors from './selectors';
import actions from '../../actions';
import {toast} from "react-toastify";

import { Modal, ModalBody} from 'reactstrap';

import PlacesAutocomplete, { geocodeByAddress,
    geocodeByPlaceId,
    getLatLng } from 'react-places-autocomplete';

import Geocode from "react-geocode";

Geocode.setApiKey(process.env.GOOGLE_API_KEY);
Geocode.setRegion("au");
Geocode.setLocationType("ROOFTOP");

const customStyles = {
    control: (base, state) => ({
        ...base,
        border: '1 !important',
        borderRadius: 20,
        borderColor: '#10547F'
    }),
}

class PageHeader extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            mainCategorySelected: null,
            subCategorySelected: null,
            revealCategorySelected: null,
            range: 0,
            keyword: null,
            location: JSON.parse(localStorage.getItem('user_location')),
            viewMode: 'week',
            job_id: null,
            sel_user: null,
            sel_job: null,
            users: [],
            jobs: [],
            start_date: new Date(),
            end_date: new Date(),
            collapsed: false,
            is_favorite: false,
            address: '',
            subUser: localStorage.getItem(constant.SUB_USERS),
            isModalOpened: false
        };

        this.lastValue = null;
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleFavoriteFilter = this.handleFavoriteFilter.bind(this);
        this.searchJob = this.searchJob.bind(this);
        this.searchJobber = this.searchJobber.bind(this);
        this.handleReport = this.handleReport.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const { scheduleHeaderParams: { viewMode } } = this.props;
        if (viewMode !== nextProps.scheduleHeaderParams.viewMode) {
            this.setState({ viewMode: nextProps.scheduleHeaderParams.viewMode });
        }

        if(this.props.location !== nextProps.location) {
            const { location: { search } } = nextProps;
            const nextStates = {};
            const job_id = (new URLSearchParams(search)).get("jobId");
            if (job_id) {
                nextStates.job_id = job_id
            }
            const viewMode = (new URLSearchParams(search)).get("viewMode");
            if (viewMode) {
                nextStates.viewMode = viewMode
            }
            const start_date = (new URLSearchParams(search)).get("startDate");
            nextStates.start_date = start_date?moment(start_date).toDate():new Date();
            this.setState(nextStates);
        }
    }

    componentDidMount() {
        const { type, getCategories } = this.props;
        const { location } = this.state;

        if (type === 'my_jobs' || type === 'all_jobs') {
            getCategories();
        }

        if (location != null) {
            this.setState({
                address: location.address
            });
        } else if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition((position) => {

                Geocode.fromLatLng(position.coords.latitude, position.coords.longitude).then(
                    (response) => {
                        const new_address = response.results[0].formatted_address;
                        const new_place_name = new_address.split(",")[0];
                        console.log(new_address);

                        const new_location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            address: new_address,
                            place_name: new_place_name
                        }
                        this.setState({
                            location: new_location,
                            address: new_address
                        });
                        localStorage.setItem('user_location', JSON.stringify(new_location));
                    },
                    (error) => {
                      console.error(error);
                    }
                  );
            });
        }
        if(this.props.location.search) {
            const { location: { search } } = this.props;
            const job_id = (new URLSearchParams(search)).get("jobId");
            const viewMode = (new URLSearchParams(search)).get("viewMode");
            const start_date = (new URLSearchParams(search)).get("startDate");
            this.setState({job_id, viewMode, start_date: start_date?moment(start_date).toDate():new Date()});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.categories !== this.props.categories) {
            this.setState({
                mainCategorySelected: null,
                subCategorySelected: null
            })
        }

        if(this.props.location !== prevProps.location) {
            const { location: { search } } = this.props;
            const nextStates = {};
            const job_id = (new URLSearchParams(search)).get("jobId");
            if (job_id) {
                nextStates.job_id = job_id;
            }
            const viewMode = (new URLSearchParams(search)).get("viewMode");
            if (viewMode) {
                nextStates.viewMode = viewMode;
            }
            const start_date = (new URLSearchParams(search)).get("startDate");
            nextStates.start_date = start_date?moment(start_date).toDate():new Date();
            this.setState(nextStates);
        }
    }

    handleChange = (address) => {
        if (!address) {
            this.setState({
                address,
                location: null
            }, this.doUpdate);
        } else {
            this.setState({ address });
        }
    };

    handleSelect = (address) => {
        geocodeByAddress(address)
        .then(results => getLatLng(results[0]))
        .then(latLng => {
            let place_name = address.split(',')[0];
            let new_location = {
                address,
                longitude: latLng.lng,
                latitude: latLng.lat,
                place_name
            };
            this.setState({
                address: address,
                location: new_location
            }, this.doUpdate);
        }).catch(error => console.error('Error', error));
    };

    selectCategory = (type, value = null) => {
        if (type === 'main') {
            const { mainCategorySelected } = this.state;

            if (mainCategorySelected !== value) {
                this.setState({
                    mainCategorySelected: value,
                    subCategorySelected: null,
                    revealCategorySelected: null
                }, this.doUpdate);
            }
        } else if (type === 'sub') {
            const { subCategorySelected } = this.state;

            if (subCategorySelected !== value) {
                this.setState({
                    subCategorySelected: value,
                    revealCategorySelected: null
                }, this.doUpdate);
            }
        } else if (type === 'reveal') {
            const { revealCategorySelected } = this.state;

            if (revealCategorySelected !== value) {
                this.setState({
                    revealCategorySelected: value
                }, this.doUpdate);
            }
        }
    };

    handleInputChange = ({ target }) => {
        this.setState({
            [target.name]: target.value
        }, () => {
            if (target.name === 'keyword') {
                this.doUpdate();
            }
        });
    };

    handleSelectChange = (name, value) => {
        this.setState({
            [name]: value
        }, this.doUpdate)
    };

    doUpdate = () => {
        const { type } = this.props;

        if (type === 'my_jobs' || type === 'all_jobs') {
            const { mainCategorySelected, subCategorySelected, revealCategorySelected, range, keyword, location } = this.state,
                { updateSearchParams, categories } = this.props;
            let searchCategories = [];
            if(mainCategorySelected) {
                if(subCategorySelected) {
                    if (revealCategorySelected) {
                        searchCategories.push({main: mainCategorySelected, sub: subCategorySelected, reveal: revealCategorySelected});
                    } else {
                        const revealCategories = categories.find(el=>el.main === subCategorySelected);
                        if (revealCategories) {
                            for(let i = 0; i < revealCategories.sub.length; i += 1)  {
                                searchCategories.push({main: mainCategorySelected, sub: subCategorySelected,  reveal: revealCategories.sub[i]});
                            }
                        } else {
                            searchCategories.push({main: mainCategorySelected, sub: subCategorySelected});
                        }
                    }
                } else {
                    const subCategories = categories.find(el=>el.main === mainCategorySelected);
                    for(let i = 0; i < subCategories.sub.length; i += 1)  {
                        const revealCategories = categories.find(el=>el.main === subCategories.sub[i]);
                        if (revealCategories) {
                            for(let j = 0; j < revealCategories.sub.length; j += 1)  {
                                searchCategories.push({main: mainCategorySelected, sub: subCategories.sub[i], reveal: revealCategories.sub[j]});
                            }
                        } else {
                            searchCategories.push({main: mainCategorySelected, sub: subCategories.sub[i]});
                        }
                    }
                }
            }
            updateSearchParams({ keyword, range, location, categories: searchCategories });
        } else if (type === 'schedule') {
            const { viewMode, job_id } = this.state,
                { history: {push} } = this.props;
            let { start_date } = this.state;

            if (viewMode  === 'day') {
                start_date = start_date?moment(start_date).set({hour: 0, minute: 0, second: 0}):moment().set({hour: 0, minute: 0, second: 0});
            } else if (viewMode  === 'year') {
                start_date = start_date?moment(start_date).startOf('year'):moment().startOf('year');
            } else {
                start_date = start_date?moment(start_date).startOf('isoWeek'):moment().startOf('isoWeek');
            }
            start_date = moment(start_date).format('YYYY-MM-DDTHH:mm:ssZ');
            
            let params = `?viewMode=${viewMode}&startDate=${encodeURIComponent(start_date).replace(" ", "%20")}`;
            if(job_id)
                params += `&jobId=${job_id}`
            push({pathname: paths.client.APP_SCHEDULE, search: params});
        } else if (type === 'invites_request') {
            const { range, keyword, location, is_favorite, mainCategorySelected, subCategorySelected } = this.state,
                { updateUserSearchParams, categories } = this.props;
            let searchCategories = [];
            if(mainCategorySelected) {
                if(subCategorySelected) {
                    searchCategories.push({main: mainCategorySelected, sub: subCategorySelected});
                }else {
                    const subCategories = categories.find(el=>el.main === mainCategorySelected);
                    for(let i = 0; i < subCategories.sub.length; i += 1)  {
                        searchCategories.push({main: mainCategorySelected, sub: subCategories.sub[i]});
                    }
                }
            }

            updateUserSearchParams({ keyword, range, location, is_favorite, categories: searchCategories});
        }
    };

    selectUser = (opt) => {
        this.setState({
            sel_user: opt
        })
    }

    selectJob = (opt) => {
        this.setState({
            sel_job: opt
        })
    }

    handleChangeDate(id, date) {
        if (id === 'start_date') {
            this.setState({ start_date: date }, () => {
                if (this.props.type === 'schedule') {
                    this.doUpdate()
                }
            });
        } else if(id === 'end_date') {
            this.setState({end_date: date});
        }
    }

    searchJobber(){
        const { findContractJobbers } = this.props;
        findContractJobbers({limit: 10, keyword: this.refs.inputjobber.state.inputValue, lastValue: this.lastValue})
        .then(({result: {data}}) => {
            if(data.result === 'success') {
                let users = [];
                for(let i = 0; i < data.jobbers.length; i += 1){
                    if(data.jobbers[i]) {
                        const option = {label: data.jobbers[i].first_name + ', ' + data.jobbers[i].last_name, value: data.jobbers[i]};
                        users.push(option);
                    }
                }
                this.setState({
                    users: users
                });
            }else{
                this.setState({
                    users: []
                });
            }
        });
    }

    handleFavoriteFilter(ev) {
        if(ev.target.id === 'all_jobbers'){
            this.setState({
                is_favorite: false
            }, this.doUpdate);
        }else if(ev.target.id === 'favorite_jobbers') {
            this.setState({
                is_favorite: true
            }, this.doUpdate);
        }
    }

    searchJob(){
        const { getJobs } = this.props;

        getJobs({offset: 1, orderBy: 'createdAt', limit: 10, keyword: this.refs.inputjob.state.inputValue, onlySelf: true})
        .then(({result: {data}}) =>{
            if (data.result === 'success') {
                let jobs = [];
                for(let i = 0; i < data.jobs.length; i += 1){
                    const option = {label: data.jobs[i].title, value: data.jobs[i]};
                    jobs.push(option);
                }
                this.setState({jobs});
            } else {
                this.setState({jobs: []});
            }
        })
    }

    handleReport() {
        const { sel_job, sel_user, start_date, end_date, viewMode } = this.state;
        const { onReport } = this.props;
        onReport(sel_job?sel_job.value.id:null, sel_user?sel_user.value.id:null, start_date, end_date, viewMode)
    }

    onPublishSchedule = () => {
        const { schedulesByJob, updateSchedules } = this.props;
        const schedulesUpdated = [];

        for (const job of schedulesByJob) {
            for (const schedule of job.schedules) {
                if (schedule.unpublished) {
                    schedulesUpdated.push({
                        ...schedule,
                        job: {
                            id: job.id,
                            title: job.title
                        }
                    })
                }
            }
        }

        updateSchedules({ schedules: schedulesUpdated }).then((res) => {

            this.setState({ isModalOpened: true });

            // const { scheduleHeaderParams: { start_date }, getSchedules } = this.props;

            const {  getSchedules } = this.props;

            const { start_date, viewMode } = this.state;

            let formatted_start_date = moment(start_date).format();

            const params = {
                start_date: formatted_start_date
            };

            if (viewMode === 'day') {
                params.end_date = moment(params.start_date).add(1, 'days').set({hour: 23, minute: 59, second: 59}).format();
            } else if (viewMode === 'week') {
                params.end_date = moment(params.start_date).add(6, 'days').set({hour: 23, minute: 59, second: 59}).format();
            } else if (viewMode === '2-weeks') {
                params.end_date = moment(params.start_date).add(13, 'days').set({hour: 23, minute: 59, second: 59}).format();
            } else if (viewMode === '4-weeks') {
                params.end_date = moment(params.start_date).add(27, 'days').set({hour: 23, minute: 59, second: 59}).format();
            } else if (viewMode === 'month') {
                params.end_date = moment(params.start_date).endOf('month').format();
            } else if (viewMode === 'year') {
                params.end_date = moment(params.start_date).endOf('year').format();
            }
            
            getSchedules(params);
        }).catch(err => {
            console.error(err);
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    };

    handleBackToSub = (ev) => {
        ev.preventDefault();
        const { switchAccount } = this.props;
        switchAccount({switch_id: null})
        .then(({result}) => {
            localStorage.removeItem(constant.SUB_USERS)
            location.href = paths.client.APP_BASE;
        }).catch(({response: {data}}) => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    renderUserSearch = () => {
        const { range, keyword, location, mainCategorySelected, revealCategorySelected, subCategorySelected, address } = this.state;
        const { isLoading, categories, onSendInvite } = this.props,
            categorySelected = categories.filter(item => {
                return item.main === mainCategorySelected
            })[0];
        const revealSelected = categories.filter(item => {
            return item.main === subCategorySelected
        })[0];
        const searchOptions = {
            componentRestrictions: { country: ['au'] }
        }
        return (
            <div className="search-wrapper">
                <div className="top">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <img src="/static/images/icons/icon-search.svg" alt="" />
                        </div>

                        <input type="text" name="keyword" className="form-control" placeholder="Search ..." value={keyword} onChange={this.handleInputChange} />
                    </div>

                    <button className="btn btn-icon btn-default collapsed" data-toggle="collapse" data-target=".filter-card" aria-expanded="false" aria-controls="filter-card">
                        <div className="icon-filter" />
                    </button>
                    <button className="btn btn-success send-invite-but" onClick={onSendInvite}>Send Invite</button>
                </div>

                <div className="collapse filter-card">
                    <div className="card card-body">
                        {isLoading ?
                        <Loader />
                        :
                        <div className="row">
                            <div className="col-12 mb-2">
                                <h6>Categories</h6>
                                <div className="categories-wrapper">
                                    <PerfectScrollbar
                                        options={{
                                            suppressScrollY: true
                                        }}
                                    >
                                        <div className="categories-inner">
                                            <span className={`item${mainCategorySelected ? '' : ' active'}`} onClick={() => this.selectCategory('main')}>
                                                All
                                            </span>
                                            {categories.filter(item=>item.deep === 1).map((item) => {
                                                return (
                                                    <span key={item.id} className={`item${mainCategorySelected === item.main ? ' active' : ''}`} onClick={() => this.selectCategory('main', item.main)}>
                                                        {item.deep === 1 && item.main}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </PerfectScrollbar>
                                    {mainCategorySelected && categorySelected && categorySelected.deep === 1 && categorySelected.sub &&
                                    <PerfectScrollbar
                                        options={{
                                            suppressScrollY: true
                                        }}
                                    >
                                        <div className="categories-inner">
                                            <span className={`item${subCategorySelected ? '' : ' active'}`} onClick={() => this.selectCategory('sub')}>
                                                All
                                            </span>
                                            {categorySelected.sub.map((item, index) => {
                                                return (
                                                    <span key={index} className={`item${subCategorySelected === item ? ' active' : ''}`} onClick={() => this.selectCategory('sub', item)}>
                                                        {item}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </PerfectScrollbar>
                                    }
                                    {mainCategorySelected && revealSelected && revealSelected.deep === 2 && revealSelected.sub &&
                                    <PerfectScrollbar
                                        options={{
                                            suppressScrollY: true
                                        }}
                                    >
                                        <div className="categories-inner">
                                                <span className={`item${revealCategorySelected ? '' : ' active'}`} onClick={() => this.selectCategory('reveal')}>
                                                    All
                                                </span>
                                            {revealSelected.sub.map((item, index) => {
                                                return (
                                                    <span key={index} className={`item${revealCategorySelected === item ? ' active' : ''}`} onClick={() => this.selectCategory('reveal', item)}>
                                                            {item}
                                                        </span>
                                                );
                                            })}
                                        </div>
                                    </PerfectScrollbar>
                                    }
                                </div>
                            </div>
                            <div className="col-12">
                                <h6 className="mb-0">Location: {address || <span className="small">(No location information found)</span>}</h6>
                                <label className="small">Search within {range} km</label>
                                <input type="range" name="range" className="custom-range" value={range} onChange={this.handleInputChange} onMouseUp={this.doUpdate} onTouchEnd={this.doUpdate} />
                                <PlacesAutocomplete
                                    value={address}
                                    onChange={this.handleChange}
                                    onSelect={this.handleSelect}
                                    searchOptions={searchOptions}
                                >
                                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                    <div>
                                        <input
                                        {...getInputProps({
                                            placeholder: 'Search Places ...',
                                            className: 'location-search-input',
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
                        </div>}
                    </div>
                </div>
            </div>
        )
    };

    renderSearch = () => {
        const { isLoading, categories } = this.props,
            { mainCategorySelected, subCategorySelected, revealCategorySelected, range, keyword, location, address } = this.state,
            categorySelected = categories.filter(item => {
                return item.main === mainCategorySelected
            })[0];
        const revealSelected = categories.filter(item => {
            return item.main === subCategorySelected
        })[0];
        const searchOptions = {
            componentRestrictions: { country: ['au'] }
        }
        return (
            <div className="search-wrapper">
                <div className="top">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <img src="/static/images/icons/icon-search.svg" alt="" />
                        </div>

                        <input type="text" name="keyword" className="form-control" placeholder="Search ..." value={keyword} onChange={this.handleInputChange} />
                    </div>

                    <button className="btn btn-icon btn-default collapsed" data-toggle="collapse" data-target=".filter-card" aria-expanded="false" aria-controls="filter-card">
                        <div className="icon-filter" />
                    </button>
                </div>

                <div className="collapse filter-card">
                    <div className="card card-body">
                        {isLoading ?
                            <Loader />
                            :
                            <div className="row">
                                <div className="col-12 mb-2">
                                    <h6>Categories</h6>
                                    <div className="categories-wrapper">
                                        <PerfectScrollbar
                                            options={{
                                                suppressScrollY: true
                                            }}
                                        >
                                            <div className="categories-inner">
                                                <span className={`item${mainCategorySelected ? '' : ' active'}`} onClick={() => this.selectCategory('main')}>
                                                    All
                                                </span>
                                                {categories.filter(item=>item.deep === 1).map((item) => {
                                                    return (
                                                        <span key={item.id} className={`item${mainCategorySelected === item.main ? ' active' : ''}`} onClick={() => this.selectCategory('main', item.main)}>
                                                            {item.deep === 1 && item.main}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </PerfectScrollbar>
                                        {mainCategorySelected && categorySelected && categorySelected.deep === 1 && categorySelected.sub &&
                                        <PerfectScrollbar
                                            options={{
                                                suppressScrollY: true
                                            }}
                                        >
                                            <div className="categories-inner">
                                                <span className={`item${subCategorySelected ? '' : ' active'}`} onClick={() => this.selectCategory('sub')}>
                                                    All
                                                </span>
                                                {categorySelected.sub.map((item, index) => {
                                                    return (
                                                        <span key={index} className={`item${subCategorySelected === item ? ' active' : ''}`} onClick={() => this.selectCategory('sub', item)}>
                                                            {item}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </PerfectScrollbar>
                                        }
                                        {mainCategorySelected && revealSelected && revealSelected.deep === 2 && revealSelected.sub &&
                                        <PerfectScrollbar
                                            options={{
                                                suppressScrollY: true
                                            }}
                                        >
                                            <div className="categories-inner">
                                                <span className={`item${revealCategorySelected ? '' : ' active'}`} onClick={() => this.selectCategory('reveal')}>
                                                    All
                                                </span>
                                                {revealSelected.sub.map((item, index) => {
                                                    return (
                                                        <span key={index} className={`item${revealCategorySelected === item ? ' active' : ''}`} onClick={() => this.selectCategory('reveal', item)}>
                                                            {item}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </PerfectScrollbar>
                                        }
                                    </div>
                                </div>
                                <div className="col-12">
                                    <h6 className="mb-0">Location: {address || <span className="small">(No location information found)</span>}</h6>
                                    <label className="small">Search within {range} km</label>
                                    <input type="range" name="range" className="custom-range" value={range} onChange={this.handleInputChange} onMouseUp={this.doUpdate} onTouchEnd={this.doUpdate} />
                                    <PlacesAutocomplete
                                        value={address}
                                        onChange={this.handleChange}
                                        onSelect={this.handleSelect}
                                        searchOptions={searchOptions}
                                    >
                                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                        <div>
                                            <input
                                            {...getInputProps({
                                                placeholder: 'Search Places ...',
                                                className: 'location-search-input',
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
                        }
                    </div>
                </div>
            </div>
        )
    };

    render() {
        const { type, badgeCount } = this.props;
        const { is_favorite, subUser, isModalOpened } = this.state;
        const handleModal = () => {
            this.setState({
                isModalOpened: !isModalOpened
            });
        };

        const content = () => {
            if (type === 'my_jobs') {
                return (
                    <div className="page-header">
                        <div className="header-container">
                            <div className="page-nav">
                                <ul>
                                    <li>
                                        <NavLink exact to={paths.client.APP_BASE}>Job Posts</NavLink>
                                        {badgeCount.job_update_count>0?<div className="badge-count">{badgeCount.job_update_count}</div>:null}
                                    </li>
                                    <li>
                                        <NavLink exact to={paths.client.APP_OFFERS}>Offers</NavLink>
                                        {badgeCount.offers_count>0?<div className="badge-count">{badgeCount.offers_count}</div>:null}    
                                    </li>
                                    <li>
                                        <NavLink exact to={paths.client.APP_CONTRACTS}>Contracts</NavLink>
                                        {badgeCount.contract_count>0?<div className="badge-count">{badgeCount.contract_count}</div>:null}
                                    </li>
                                    <li>
                                        <NavLink exact to={paths.client.APP_INVITES}>Jobber Invites</NavLink>
                                        {badgeCount.invite_count>0?<div className="badge-count">{badgeCount.invite_count}</div>:null}
                                    </li>
                                </ul>
                            </div>

                            {/* {this.renderSearch()} */}
                        </div>
                        {subUser?<div className="header-sub-action" onClick={this.handleBackToSub}>Back to your account</div>:null}
                    </div>
                );
            } else if (type === 'offers' || type === 'contracts' || type === 'invites') {
                return (
                    <div className="page-header">
                        <div className="header-container">
                            <div className="page-nav">
                                <ul>
                                    <li>
                                        <NavLink exact to={paths.client.APP_BASE}>Job Posts</NavLink>
                                        {badgeCount.job_update_count>0?<div className="badge-count">{badgeCount.job_update_count}</div>:null}
                                    </li>
                                    <li>
                                        <NavLink exact to={paths.client.APP_OFFERS}>Offers</NavLink>
                                        {badgeCount.offers_count>0?<div className="badge-count">{badgeCount.offers_count}</div>:null}    
                                    </li>
                                    <li>
                                        <NavLink exact to={paths.client.APP_CONTRACTS}>Contracts</NavLink>
                                        {badgeCount.contract_count>0?<div className="badge-count">{badgeCount.contract_count}</div>:null}
                                    </li>
                                    <li>
                                        <NavLink exact to={paths.client.APP_INVITES}>Jobber Invites</NavLink>
                                        {badgeCount.invite_count>0?<div className="badge-count">{badgeCount.invite_count}</div>:null}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {subUser?<div className="header-sub-action" onClick={this.handleBackToSub}>Back to your account</div>:null}
                    </div>
                );
            } else if (type === 'archive') {
                return (
                    <div className="page-header">
                        <div className="header-container">
                            <div className="page-nav">
                                <ul>
                                    <li><NavLink exact to={paths.client.APP_OFFERS+"?archive=true"} isActive={(match, location) => location.pathname === paths.client.APP_OFFERS}><span>Archived </span>Offers</NavLink></li>
                                    <li><NavLink exact to={paths.client.APP_CONTRACTS+"?archive=true"} isActive={(match, location) => location.pathname === paths.client.APP_CONTRACTS}><span>Archived </span>Contracts</NavLink></li>
                                    <li><NavLink exact to={paths.client.APP_MESSAGES+"?archive=true"} isActive={(match, location) => location.pathname === paths.client.APP_MESSAGES}><span>Archived </span>Chats</NavLink></li>
                                </ul>
                            </div>

                            {/* {this.renderSearch()} */}
                        </div>
                        {subUser?<div className="header-sub-action" onClick={this.handleBackToSub}>Back to your account</div>:null}
                    </div>
                );
            } else if (type === 'all_jobs') {
                return (
                    <div className="page-header">
                        <div className="header-container">
                            <NavLink className="btn btn-outline-success mobile-create-job" exact to={paths.client.APP_NEW_JOB}>Create Job</NavLink>
                            {this.renderSearch()}
                        </div>
                        {subUser?<div className="header-sub-action" onClick={this.handleBackToSub}>Back to your account</div>:null}
                    </div>
                );
            } else if (type === 'invites_request') {
                return (
                    <div className="page-header">
                        <h1 style={{marginTop: "1rem", marginBottom: "0"}}>Invite Jobbers</h1>
                        <div className="header-container-rs">
                            <div className="page-nav">
                                <ul>
                                    <li><div className={`tab-bar${is_favorite?'':' active'}`} id="all_jobbers" onClick={this.handleFavoriteFilter}>All Jobbers</div></li>
                                    <li><div className={`tab-bar${is_favorite?' active':''}`} id="favorite_jobbers" onClick={this.handleFavoriteFilter}>Favorite Jobbers</div></li>
                                </ul>
                            </div>
                            {this.renderUserSearch()}
                        </div>
                        {subUser?<div className="header-sub-action" onClick={this.handleBackToSub}>Back to your account</div>:null}
                    </div>
                );
            } else if (type === 'schedule') {
                const viewModeOpt = [
                    { value: "day", label: "Day" },
                    { value: "week", label: "Week" },
                    { value: "2-weeks", label: "2-Weeks" },
                    { value: "4-weeks", label: "4-Weeks" },
                    { value: "year", label: "Year" }
                ];
                const { isPublishing, schedulesByJob } = this.props;
                const { viewMode, job_id } = this.state;
                const jobsOpt = [
                    { value: null, label: "All Jobs" },
                    ...schedulesByJob.map(job => ({ value: job.id, label: job.title }))
                ]

                return (
                    <div className="page-header">
                        <div className="header-container-fluid">
                            <div className="header-content">
                                <div className="job-picker">
                                    <Select
                                        options={jobsOpt}
                                        value={jobsOpt.filter(item => item.value === job_id)}
                                        onChange={({ value }) => this.handleSelectChange('job_id', value)}
                                        disabled={isPublishing}
                                    />
                                </div>
                                <div className="datetime-picker d-none d-md-block">
                                    <DateInputPicker
                                        id="start_date"
                                        className="date-picker"
                                        value={this.state.start_date}
                                        onChange={this.handleChangeDate}
                                        disabled={isPublishing}
                                        viewMode={viewMode}
                                    />
                                </div>
                                <div className="view-mode d-none d-lg-block">
                                    <Select
                                        options={viewModeOpt}
                                        value={viewModeOpt.filter(item => item.value === viewMode)}
                                        onChange={({ value }) => this.handleSelectChange('viewMode', value)}
                                        disabled={isPublishing}
                                    />
                                </div>
                            </div>

                            <button className="btn btn-success" onClick={this.onPublishSchedule} disabled={isPublishing}>Publish Schedule Updates</button>

                            <Modal isOpen={isModalOpened} className="schedule-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                                <div className="modal-dialog-header">
                                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleModal}/>
                                </div>

                                <ModalBody>
                                    <p>You have successfully updated your schedule(s) with new jobber invites.</p>
                                </ModalBody>
                                <div className="footer" style={{ padding:10, margin:'auto' }}>
                                    <button className="btn btn-success" onClick={handleModal}>Ok</button>
                                </div>
                            </Modal>

                        </div>
                        {subUser?<div className="header-sub-action" onClick={this.handleBackToSub}>Back to your account</div>:null}
                    </div>
                );
            }else if (type === 'reports') {
                const viewModeOpt = [{value: "day", label: "Daily"}, {value: "week", label: "Weekly"}, {value: "month", label: "Monthly"}, {value: "quarter", label: "Quarterly"}, {value: "year-to-date", label: "Year to date"}, {value: "yearly", label: "Yearly"}];
                const { viewMode, users, jobs, sel_job, sel_user } = this.state;

                return (
                    <div className="page-header">
                        <div className="header-container-center">
                            {/* <div className="daily">
                                <Select
                                    options={viewModeOpt}
                                    onChange={({ value }) => this.setState({'viewMode': value})}
                                    value={viewModeOpt.filter(item => item.value === viewMode)}
                                />
                                <div className="view-calendar">
                                    <img src="/static/images/icons/icon-view-calendar.svg" alt=""/>
                                </div>
                            </div> */}
                            <div className="date-from">
                                <DateInputPicker className="date-picker" id="start_date" value={this.state.start_date} onChange={this.handleChangeDate}/>
                            </div>
                            <div className="date-to">
                                <DateInputPicker className="date-picker" id="end_date" value={this.state.end_date} onChange={this.handleChangeDate}/>
                            </div>
                            <div className="job-search">
                                <div onKeyUp={this.searchJob}>
                                    <ReactSelect
                                        ref="inputjob"
                                        styles={customStyles}
                                        name="repolist"
                                        placeholder="Search Job"
                                        className={'select-container'}
                                        classNamePrefix="select"
                                        options={jobs}
                                        value={sel_job}
                                        onChange={this.selectJob}/>
                                </div>
                            </div>
                            <div className="jobber-search">
                                <div onKeyUp={this.searchJobber}>
                                    <ReactSelect
                                        ref="inputjobber"
                                        styles={customStyles}
                                        name="repolist"
                                        placeholder="Search Jobber"
                                        className={'select-container'}
                                        classNamePrefix="select"
                                        options={users}
                                        value={sel_user}
                                        onChange={this.selectUser}/>
                                </div>
                            </div>
                            <button className="btn btn-success" onClick={this.handleReport}>Run Report</button>
                        </div>
                        {subUser?<div className="header-sub-action" onClick={this.handleBackToSub}>Back to your account</div>:null}
                    </div>
                );
            }

            return null;
        };

        return content();
    }
}

PageHeader.propTypes = {
    type: PropTypes.string.isRequired,
    getCategories: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isPublishing: PropTypes.bool.isRequired,
    categories: PropTypes.array.isRequired,
    badgeCount: PropTypes.object,
    schedulesByJob: PropTypes.array.isRequired,
    scheduleHeaderParams: PropTypes.shape({}).isRequired,
    updateSearchParams: PropTypes.func.isRequired,
    updateUserSearchParams: PropTypes.func.isRequired,
    getSchedules: PropTypes.func.isRequired,
    updateSchedules: PropTypes.func.isRequired,
    onReport: PropTypes.func,
    getJobs: PropTypes.func,
    getUsers: PropTypes.func,
    getFavoriteUsers: PropTypes.func,
    findContractJobbers: PropTypes.func,
    onSendInvite: PropTypes.func,
    switchAccount: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func,
    }),
};

export default connect(
    selectors,
    {
        ...actions.authentication,
        ...actions.categories,
        ...actions.jobs,
        ...actions.schedules,
        ...actions.users,
        ...actions.contracts
    }
)(withRouter(PageHeader));
