import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Prompt } from 'react-router';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { DndProvider } from 'react-dnd'
import PerfectScrollbar from 'react-perfect-scrollbar';
import Backend from 'react-dnd-html5-backend'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import moment from 'moment';
import $ from 'jquery';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Modal, ModalBody} from 'reactstrap';

import selectors from './selectors';
import actions from '../../../actions';
import { constant, messages, paths } from '../../../../../../utils';
import Avatar from './avatar';
import JobberRow from './jobber';
import YearView from './year';
import Time from './time';
import Loader from '../loader';
import JobModal from '../jobmodal';
import ConfirmDialog from '../../ConfirmDialog';
import FilterIcon from '../../../../icons/filter.svg';
import SearchIcon from '../../../../icons/search.svg';
import PencilIcon from '../../../../icons/pencil.svg';
import TrashIcon from '../../../../icons/trash.svg';
import PlusIcon from '../../../../icons/plus.svg';

class DesktopView extends Component {
    constructor(props) {
        super(props);

        const filters = JSON.parse(localStorage.getItem('filters')) || null;

        // Set Initial State
        this.state = {
            mainCategorySelected: filters ? filters.mainCategorySelected : null,
            subCategorySelected: filters ? filters.subCategorySelected : null,
            revealCategorySelected: filters ? filters.revealCategorySelected : null,
            jobbers: [],
            showLoadMore: false,
            jobToClose: null,
            isOpen: false,
            job: null,
            time: null,
            contract: null,
            showJobberFilter: filters ? filters.showJobberFilter : false,
            keyword: filters ? filters.keyword : null,
            get_favorite: filters ? filters.get_favorite : false,
            jobber_type: filters ? filters.jobber_type : '',
            range: filters ? parseInt(filters.range) : 1,
            location: filters ? filters.location : JSON.parse(localStorage.getItem('user_location')),
            address: '',
        };
        this.statistics = {
            assigned: 0,
            open: 0,
            unpublished: 0,
        };
        this.lastValue = null;
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    componentDidMount() {
        const { getCategories } = this.props;
        const { location } = this.state;

        if (this.props.viewMode !== 'year') {
            this.fetchJobbers();
            getCategories();
        }

        if (location != null) {
            this.setState({
                address: location.address,
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
                            location: new_location
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

    onClickFilter = () => {
        const { showJobberFilter } = this.state;

        this.setState({
            showJobberFilter: !showJobberFilter,
        });
        if (!showJobberFilter) {
            document.addEventListener('click', this.closeFilter);
        }

        const filters = localStorage.getItem('filters') ? JSON.parse(localStorage.getItem('filters')) : null;
        
        if (filters) {
            filters.showJobberFilter = !showJobberFilter;
            
            localStorage.setItem('filters', JSON.stringify(filters));
        }
    };

    closeFilter = (e) => {
        if (!$(e.target).closest('.filter-opened').length) {
            document.removeEventListener('click', this.closeFilter);
            this.setState({
                showJobberFilter: false
            });
        }
    };

    handleInputChange = ({ target: { name, value } }) => {
        this.setState({
            [name]: value,
            jobbers: []
        }, () => {
            this.lastValue = null;
            this.fetchJobbers();
        });
    };

    selectFavorite = (is_favorite) => {
        this.setState({
            get_favorite: is_favorite,
            jobbers: []
        }, () => {
            this.lastValue = null;
            this.fetchJobbers();
        });
    };

    selectJobberType = (value) => {
        this.setState({
            jobber_type: value,
            jobbers: []
        }, () => {
            this.lastValue = null;
            this.fetchJobbers();
        })
    };

    selectCategory = (type, value = null) => {
        const { mainCategorySelected, subCategorySelected, revealCategorySelected } = this.state;

        if (type === 'main') {
            if (mainCategorySelected !== value) {
                this.setState({
                    mainCategorySelected: value,
                    subCategorySelected: null,
                    revealCategorySelected: null,
                    jobbers: []
                }, () => {
                    this.lastValue = null;
                    this.fetchJobbers();
                });
            }
        } else if (type === 'sub') {
            if (subCategorySelected !== value) {
                this.setState({
                    subCategorySelected: value,
                    revealCategorySelected: null,
                    jobbers: []
                }, () => {
                    this.lastValue = null;
                    this.fetchJobbers();
                });
            }
        } else if (type === 'reveal') {
            if (revealCategorySelected !== value) {
                this.setState({
                    revealCategorySelected: value,
                    jobbers: []
                }, () => {
                    this.lastValue = null;
                    this.fetchJobbers();
                });
            }
        }
    };

    fetchJobbers = () => {
        const { categories } = this.props;
        const { keyword, jobber_type, get_favorite, mainCategorySelected, subCategorySelected, revealCategorySelected, range, location, jobbers, showJobberFilter } = this.state;
        let API;
        const searchCategories = [];

        const filters = {
            keyword: keyword,
            jobber_type: jobber_type,
            get_favorite: get_favorite,
            mainCategorySelected: mainCategorySelected,
            subCategorySelected: subCategorySelected,
            revealCategorySelected: revealCategorySelected,
            range: range,
            location: location,
            showJobberFilter: showJobberFilter
        };

        localStorage.setItem('filters', JSON.stringify(filters));

        if(mainCategorySelected) {

            if(subCategorySelected) {
                if (revealCategorySelected) {
                    searchCategories.push({main: mainCategorySelected + " - " + subCategorySelected, sub: revealCategorySelected });
                } else {
                    const revealCategories = categories.find(el=>el.main === subCategorySelected);
                    if (revealCategories) {
                        for(let i = 0; i < revealCategories.sub.length; i += 1)  {
                            searchCategories.push({main: mainCategorySelected + " - " + subCategorySelected, sub: revealCategories.sub[i] });
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
                            searchCategories.push({main: mainCategorySelected + " - " + subCategories.sub[i], sub: revealCategories.sub[j]});
                        }
                    } else {
                        searchCategories.push({main: mainCategorySelected, sub: subCategories.sub[i]});
                    }
                }
            }
        }

        if (get_favorite) {
            API = this.props.getFavoriteUsers;
        } else {
            API = this.props.getUsers;
        }

        const params = {
            keyword,
            jobber_type,
            range,
            location,
            orderBy: 'id',
            limit: 15,
            lastValue: this.lastValue
        };

        if (searchCategories.length) {
            params.categories = searchCategories;
        }

        API(params).then(({ result: { data } }) => {
            const { users, total, lastValue } = data;
            //const jobbers = this.state.jobbers.concat(users);
            const new_jobbers = jobbers.length ? jobbers.concat(users) : users;

            this.lastValue = lastValue;
            this.setState({
                jobbers: new_jobbers,
                showLoadMore: jobbers.length < total
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    };

    handleScroll = container => {
        this.headerRef.scrollLeft = container.scrollLeft;
    };

    locationChange = (address) => {
        if (!address) {
            this.setState({
                address,
                location: null,
                jobbers: []
            }, () => {
                this.lastValue = null;
                this.fetchJobbers();
            });
        } else {
            this.setState({ address });
        }
        
    };

    locationSelect = (address) => {
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
                    address,
                    location: new_location,
                    jobbers: []
                }, () => {
                    this.lastValue = null;
                    this.fetchJobbers();
                });
            }).catch(error => console.error('Error', error));
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
                location: new_location
            }, this.doUpdate);
        }).catch(error => console.error('Error', error));
    };

    showModal = (ev, job, time) => {
        ev.preventDefault();
        const { getContracts } = this.props;

        getContracts({job_id: job.id})
        .then(({result: {data}}) => {
            if(data) {
                const contract = data.contracts.find((el) => {
                    return el.hirer_id === this.authUser.id || el.jobber_id === this.authUser.id;

                });
                this.setState({job, contract, time, isOpen: true});
            }
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    };

    closeModal = () => {
        this.setState({
            job: null,
            time: null,
            isOpen: false,
            isFeedOpen: false,
        })
    };

    renderScheduleList = (job, cellWidth) => {
        const { location: { search }, updateSchedule, history } = this.props;
        const job_id = (new URLSearchParams(search)).get("jobId");
        const viewMode = (new URLSearchParams(search)).get("viewMode") || 'day';
        const start_date = (new URLSearchParams(search)).get("startDate") || moment();
        const startDate = start_date?moment(start_date):moment();

        const time_arr = [[]];

        for (const schedule of job.schedules) {
            if (schedule.unpublished) {
                this.statistics.unpublished += 1;
            } else if (schedule.jobbers.length > 0) {
                this.statistics.assigned += 1;
            } else {
                this.statistics.open += 1;
            }

            for (const time of schedule.time_field) {
                const begin = moment(time['from']);
                const end = moment(time['to']);
                let pos = 0, length = 0;

                if (viewMode === 'day') {
                    pos = begin.diff(startDate, 'hours');
                    length = end.diff(begin, 'hours') + 1;
                } else {
                    pos = begin.diff(startDate, 'days');
                    length = end.diff(begin, 'days') + 1;
                }

                let is_added = false;
                for (let i = 0; i < time_arr.length; i++) {
                    let is_duplicated = false;

                    for (const item of time_arr[i]) {
                        if (item.pos >= pos && item.pos < pos + length) {
                            is_duplicated = true;
                            break;
                        } else if (pos >= item.pos && pos < item.pos + item.length) {
                            is_duplicated = true;
                            break;
                        }
                    }

                    if (!is_duplicated) {
                        is_added = true;
                        time_arr[i].push({
                            begin: begin.format('ha'),
                            end: end.format('ha'),
                            schedule,
                            user: job.user,
                            pos: pos,
                            length: length
                        });
                        break;
                    }
                }

                if (!is_added) {
                    time_arr.push([{
                        begin: begin.format('ha'),
                        end: end.format('ha'),
                        schedule,
                        user: job.user,
                        pos: pos,
                        length: length
                    }]);
                }
            }
        }

        return time_arr.map((arr, idx) => (
            <div className="job-schedule" key={idx}>
                {arr.map((time, i) => (
                    <Time
                        onClick={(ev) => this.showModal(ev, job, time)}
                        key={i}
                        cellWidth={cellWidth}
                        updateSchedule={updateSchedule}
                        history={history}
                        {...time}
                    />
                ))}
            </div>
        ))
    };

    closeJob = () => {
        const { jobToClose } = this.state;
        const { closeJob, removeJob } = this.props;

        if (jobToClose) {
            closeJob(jobToClose).then(() => {
                toast.success("Job has been closed successfully.");
                removeJob(jobToClose);
            }).catch((err) => {
                console.error(err);
                toast.error("Failed to close job.")
            });
            this.dismissModal();
        }
    };

    dismissModal = () => {
        this.setState({
            jobToClose: null
        });
    };

    onChat = (id) => {
        const { createChat, history: {push}, getIsArchivedRoom } = this.props;
        const { jobbers } = this.state;
        const user_ids = [this.authUser.id, id];
        const jobber = jobbers.find(el=>el.id === id);
        const title = null;
        createChat({user_ids, title, job_id: null, type: "direct"})
        .then(({result: {data}}) => {
            const {room} = data;
            getIsArchivedRoom({roomId: room.id})
            .then(({result: {data}}) => {
                const { isArchived } = data;
                const archivedQuery = isArchived?'&archive=true':'';
                push(`${paths.client.APP_MESSAGES}?roomId=${room.id + archivedQuery}`);
            }).catch((error) => {
                console.log(error)
                toast.error(messages.CHAT_ROOM_FAILED);
            })
        }).catch((error) => {
            console.log(error)
            toast.error(messages.CHAT_ROOM_FAILED);
        })
    }

    onFavoriteJobber = (id, is_favorite) => {
        const { favoriteJobber } = this.props;

        favoriteJobber({
            to_user_id: id,
            is_favorite
        }).then(() => {
            const jobbers = [ ...this.state.jobbers ];

            for (let i = 0; i < jobbers.length; i ++) {
                if (jobbers[i].id === id) {
                    jobbers[i].is_favorite = is_favorite;
                    break;
                }
            }

            this.setState({ jobbers });
        }).catch((err) => {
            console.error(err);
            toast.error("Failed to favorite jobber.")
        });
    };

    onSelectDate = (dt) => {
        const { history: {push}, location: {search} } = this.props;
        const job_id = (new URLSearchParams(search)).get("jobId");
        let params = `?viewMode=day&startDate=${encodeURIComponent(moment(dt).format('YYYY-MM-DDTHH:mm:ssZ')).replace(" ", "%20")}`;
        
        if(job_id)
            params += `&jobId=${job_id}`
        push({pathname: paths.client.APP_SCHEDULE, search: params});
    };

    openFeed = () => {
        this.setState({isFeedOpen: true});
    };

    onCopy = () => {
        let text = document.getElementById('feed');
        text.focus();
        text.select();
        document.execCommand("copy");
        // console.log(text.value);
    };

    render() {
        const {
            location: {search},
            isLoadingJobbers,
            isLoadingJobs,
            history,
            categories
        } = this.props;
        const {
            jobbers,
            showLoadMore,
            jobToClose,
            job,
            isOpen,
            isFeedOpen = false,
            time,
            contract,
            showJobberFilter,
            keyword,
            get_favorite,
            jobber_type,
            mainCategorySelected,
            subCategorySelected,
            revealCategorySelected,
            address,
            range,
            isModalOpened = true,
            location
        } = this.state;
        const job_id = (new URLSearchParams(search)).get("jobId");
        const viewMode = (new URLSearchParams(search)).get("viewMode") || 'week';
        const start_date = (new URLSearchParams(search)).get("startDate") || moment();
        const jobs = job_id ? this.props.jobs.filter(job => job.id == job_id) : this.props.jobs;
        const categorySelected = categories.find(item => item.main === mainCategorySelected);
        const revealSelected = categories.find(item => item.main === subCategorySelected);
        const headerCells = [], cells = [];
        let content;
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ foo: this.authUser.id }, 'ics_subscribe');

        const handleModal = () => {
            this.setState({
                isModalOpened: !isModalOpened
            });
        };
        this.statistics = {
            assigned: 0,
            open: 0,
            unpublished: 0
        };

        if (viewMode === 'year') {
            const times = [];
            for (const job of jobs) {
                for (const schedule of job.schedules) {
                    if (schedule.jobbers.length > 0) {
                        this.statistics.assigned += 1;
                    } else {
                        this.statistics.open += 1;
                    }
                    if (schedule.unpublished) {
                        this.statistics.unpublished += 1;
                    }

                    for (const time of schedule.time_field) {
                        times.push({
                            time: moment(time['from']).format(),
                            job: omit(job, ['schedules']),
                            schedule: omit(schedule, ['time_field'])
                        });
                        times.push({
                            time: moment(time['to']).format(),
                            job: omit(job, ['schedules']),
                            schedule: omit(schedule, ['time_field'])
                        });
                    }
                }
            }

            content = (
                <YearView
                    year={start_date?moment(start_date).format('YYYY'):moment().format('YYYY')}
                    times={times}
                    isLoading={isLoadingJobs}
                    onSelectDate={this.onSelectDate}
                />
            )
        } else {
            if (viewMode === 'day') {
                for (let i = 0; i <= 12; i++) {
                    headerCells.push(
                        <div className="header-cell">
                            <div className="top-label">am</div>
                            <div className="main-label">{i}</div>
                        </div>
                    );
                    cells.push(<div className={`cell${i % 2 === 1 ? ' odd' : ''}`} />);
                }
                for (let i = 1; i < 12; i++) {
                    headerCells.push(
                        <div className="header-cell">
                            <div className="top-label">pm</div>
                            <div className="main-label">{i}</div>
                        </div>
                    );
                    cells.push(<div className={`cell${i % 2 === 1 ? ' odd' : ''}`} />);
                }
            } else if (viewMode === 'week') {
                const dt = start_date?moment(start_date):moment();
                for (let i = 0; i < 7; i ++) {
                    headerCells.push(
                        <div className="header-cell">
                            <div className="top-label">{dt.format('ddd')}</div>
                            <div className="main-label">{dt.format('D')}</div>
                        </div>
                    );
                    cells.push(<div className="cell" />);
                    dt.add(1, 'days');
                }
            } else if (viewMode === '2-weeks') {
                const dt = start_date?moment(start_date):moment();
                for (let i = 0; i < 14; i ++) {
                    headerCells.push(
                        <div className={`header-cell${i === 6 ? ' week-separator' : ''}`}>
                            <div className="top-label">{dt.format('ddd')}</div>
                            <div className="main-label">{dt.format('D')}</div>
                        </div>
                    );
                    cells.push(
                        <div className={`cell${i === 6 ? ' week-separator' : ''}`} />
                    );
                    dt.add(1, 'days');
                }
            } else if (viewMode === '4-weeks') {
                const dt = start_date?moment(start_date):moment();
                for (let i = 0; i < 28; i ++) {
                    let cn = '';
                    if (i % 7 === 6 && i !== 27) {
                        cn = ' week-separator';
                    }
                    headerCells.push(
                        <div className={`header-cell${cn}`}>
                            <div className="top-label">{dt.format('ddd')}</div>
                            <div className="main-label">{dt.format('D')}</div>
                        </div>
                    );
                    cells.push(
                        <div className={`cell${cn}`} />
                    );
                    dt.add(1, 'days');
                }
            }
            const cellWidth = Math.max((document.body.clientWidth - 380) / cells.length, 50);

            content = (
                <DndProvider backend={Backend}>
                    <div className={`jobbers-list-content ${showJobberFilter ? ' filter-opened' : ''}`}>
                        <div className={`header${showJobberFilter ? ' filter-opened' : ''}`}>
                            <div className="header-inner">
                                <div className="name-search">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <SearchIcon />
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search Jobber Name ..."
                                            value={keyword}
                                            name="keyword"
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                    <span className="icon-filter" onClick={this.onClickFilter}>
                                    <FilterIcon />
                                </span>
                                </div>
                                {showJobberFilter && (
                                    <React.Fragment>
                                        <div className="favorite-search">
                                            <div
                                                className={`search-option${get_favorite ? ' active' : ''}`}
                                                onClick={() => this.selectFavorite(true)}
                                            >
                                                Favourite
                                            </div>
                                            <div
                                                className={`search-option${!get_favorite ? ' active': ''}`}
                                                onClick={() => this.selectFavorite(false)}
                                            >
                                                All Jobbers
                                            </div>
                                        </div>
                                        <div className="type-search">
                                            <h6>Search Jobber</h6>

                                            <div className="custom-radio">
                                                <input
                                                    type="radio"
                                                    id="option-1"
                                                    onClick={() => this.selectJobberType('') }
                                                    checked={jobber_type === ''}
                                                />

                                                <label htmlFor="option-1">All</label>
                                                <div className="check" />
                                            </div>
                                            <div className="custom-radio">
                                                <input
                                                    type="radio"
                                                    id="option-2"
                                                    onClick={() => this.selectJobberType('full_time_worker')}
                                                    checked={jobber_type === 'full_time_worker'}
                                                />

                                                <label htmlFor="option-2">Full Time</label>
                                                <div className="check" />
                                            </div>
                                            <div className="custom-radio">
                                                <input
                                                    type="radio"
                                                    id="option-3"
                                                    onClick={() => this.selectJobberType('company')}
                                                    checked={jobber_type === 'company'}
                                                />

                                                <label htmlFor="option-3">Company/Sole Trader</label>
                                                <div className="check" />
                                            </div>
                                            <div className="custom-radio">
                                                <input
                                                    type="radio"
                                                    id="option-4"
                                                    onClick={() => this.selectJobberType('casual_worker')}
                                                    checked={jobber_type === 'casual_worker'}
                                                />

                                                <label htmlFor="option-4">Casual</label>
                                                <div className="check" />
                                            </div>
                                        </div>
                                        <div className="categories-search">
                                            <span>Categories</span>
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
                                                        {categories.filter(item=>item.deep === 1).map((item) => (
                                                            <span
                                                                key={item.id}
                                                                className={`item${mainCategorySelected === item.main ? ' active' : ''}`}
                                                                onClick={() => this.selectCategory('main', item.main)}
                                                            >
                                                                {item.deep === 1 && item.main}
                                                            </span>
                                                        ))}
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
                                                        {categorySelected.sub.map((item, index) => (
                                                            <span
                                                                key={index}
                                                                className={`item${subCategorySelected === item ? ' active' : ''}`}
                                                                onClick={() => this.selectCategory('sub', item)}
                                                            >
                                                                    {item}
                                                                </span>
                                                        ))}
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
                                                        {revealSelected.sub.map((item, index) => (
                                                            <span
                                                                key={index}
                                                                className={`item${revealCategorySelected === item ? ' active' : ''}`}
                                                                onClick={() => this.selectCategory('reveal', item)}
                                                            >
                                                                    {item}
                                                                </span>
                                                        ))}
                                                    </div>
                                                </PerfectScrollbar>
                                                }
                                            </div>
                                        </div>
                                        <div className="location-search">
                                            <div className="content-info">
                                                <span>Location</span>
                                                <label className="small ml-2">Search within {range} km</label>
                                            </div>
                                            <input type="range" name="range" className="custom-range" value={range} onChange={this.handleInputChange} />
                                            <PlacesAutocomplete
                                                value={address}
                                                onChange={this.locationChange}
                                                onSelect={this.locationSelect}
                                            >
                                                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                                    <div>
                                                        <input
                                                            {...getInputProps({
                                                                placeholder: 'Type location',
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
                                    </React.Fragment>
                                )}
                            </div>
                        </div>
                        <div className="title">Jobbers</div>
                        <div className="body">
                            <PerfectScrollbar
                                options={{
                                    suppressScrollX: true
                                }}
                            >
                                <div className="jobbers-list">
                                    {jobbers.map(jobber => (
                                        <JobberRow
                                            key={jobber.id}
                                            onFavorite={this.onFavoriteJobber}
                                            onChat={this.onChat}
                                            {...jobber}
                                        />
                                    ))}
                                    {isLoadingJobbers && (
                                        <div className="loading">
                                            <span className="fa fa-spin fa-spinner" />
                                        </div>
                                    )}
                                    {!isLoadingJobbers && showLoadMore && (
                                        <div className="load-more">
                                            <a href="#" className="link-green" onClick={this.fetchJobbers}>Load more ...</a>
                                        </div>
                                    )}
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                    <div className="schedules-content">
                        <div className="header" ref={ref => this.headerRef = ref}>
                            {headerCells}
                        </div>
                        <div className="body">
                            <PerfectScrollbar
                                onScrollX={this.handleScroll}
                            >
                                <div className="schedules-wrapper" style={{ width: `${cellWidth * cells.length}px` }}>
                                    <div className="cell-list">
                                        {cells}
                                    </div>
                                    {isLoadingJobs ? (
                                        <Loader/>
                                    ) : jobs.map((job, idx) => (
                                        <div key={idx} className="job-content">
                                            <div className="job-header">
                                                {this.authUser.id !== job.user.id && (
                                                    <Avatar
                                                        url={job.user.avatar}
                                                        onClick={() => this.props.history.push(paths.build(paths.client.APP_JOBBER_PROFILE, job.user.id))}
                                                    />
                                                )}
                                                <div className={`badge badge-green${this.authUser.id !== job.user.id ? ' ml-3' : ''}`}>
                                                    {job.title}
                                                </div>
                                                {this.authUser.id === job.user.id && (
                                                    <div className="job-actions">
                                                        <span onClick={() => this.props.history.push(paths.build(paths.client.APP_EDIT_JOB, job.id))}>
                                                            <PencilIcon/>
                                                        </span>
                                                        <span onClick={() => this.setState({ jobToClose: job.id })}>
                                                            <TrashIcon/>
                                                        </span>
                                                        <span onClick={() => this.props.history.push(`${paths.build(paths.client.APP_EDIT_JOB, job.id)}#add-schedule`)}>
                                                            <PlusIcon/>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="job-schedules">
                                                {this.renderScheduleList(job, cellWidth)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                </DndProvider>
            )
        }
        let cn = 'card schedule-view-card';
        if (viewMode === 'day') {
            cn += ' daily-view'
        } else if (viewMode === 'week') {
            cn += ' weekly-view'
        } else if (viewMode === 'year') {
            cn += ' yearly-view'
        } else {
            cn += ' custom-view'
        }

        return (
            <React.Fragment>
                {this.statistics.unpublished > 0 && (
                    <Modal isOpen={isModalOpened} className="schedule-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                        <div className="modal-dialog-header">
                            <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleModal}/>
                        </div>

                        <ModalBody>
                            <p>Your edits have not been saved. Please publish your edits before leaving the page or they will be lost.</p>
                        </ModalBody>
                        <div className="footer" style={{ padding:10, margin:'auto' }}>
                            <button className="btn btn-success" onClick={handleModal}>Ok</button>
                        </div>
                    </Modal>
                )}

                <JobModal isOpen={isOpen} job={job} time={time} contract={contract} onClose={this.closeModal} history={history} />
                <div className={cn}>
                    <div className="card-body">
                        {content}
                    </div>
                </div>
                {!isLoadingJobs && (
                    <div className='schedule-status-list'>
                        <div className='status-info'>
                            <span className='status-dot assigned-status' />
                            <span>{this.statistics.assigned} Assigned</span>
                        </div>
                        <div className='status-info'>
                            <span className='status-dot open-status' />
                            <span>{this.statistics.open} Open Schedule</span>
                        </div>
                        <div className='status-info'>
                            <span className='status-dot warning-status' />
                            <span>{this.statistics.unpublished} Unpublished</span>
                        </div>
                    </div>
                )}
                <div className="schedule-subscribe">
                    <span onClick={this.openFeed}>ICS Feed</span>

                    <Modal isOpen={isFeedOpen} className="feed-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                        <div className="modal-dialog-header">
                            <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={this.closeModal}/>
                        </div>

                        <ModalBody>
                            <input id="feed" value={`${document.location.protocol}//${document.location.hostname}/app/subscribe?token=${token}`}/>
                            <span onClick={this.onCopy}>Copy</span>
                        </ModalBody>
                    </Modal>
                </div>
                <ConfirmDialog
                    isOpen={!!jobToClose}
                    description={"Are you sure you want to cancel the job post?"}
                    subDescription={"Note: Cancelling this job post does not cancel any running contracts associated with this post. To close a contact, go to your contracts tab."}
                    ok="Yes"
                    cancel="No"
                    onOk={this.closeJob}
                    onCancel={this.dismissModal}
                />
            </React.Fragment>
        );
    }
}

DesktopView.propTypes = {
    headerParams: PropTypes.shape({}).isRequired,
    jobs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isLoadingJobbers: PropTypes.bool.isRequired,
    isLoadingJobs: PropTypes.bool.isRequired,
    getUsers: PropTypes.func.isRequired,
    getContractByJobber: PropTypes.func.isRequired,
    getFavoriteUsers: PropTypes.func.isRequired,
    updateSchedule: PropTypes.func.isRequired,
    removeJob: PropTypes.func.isRequired,
    closeJob: PropTypes.func.isRequired,
    favoriteJobber: PropTypes.func.isRequired,
    getCategories: PropTypes.func.isRequired,
    isCategoriesLoaded: PropTypes.bool.isRequired,
    categories: PropTypes.array.isRequired,
    createChat: PropTypes.func.isRequired,
    getIsArchivedRoom: PropTypes.func.isRequired,

    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors,
    {
        ...actions.chats,
        ...actions.jobs,
        ...actions.users,
        ...actions.schedules,
        ...actions.favorite,
        ...actions.contracts,
        ...actions.categories,
    }
)(withRouter(DesktopView));
