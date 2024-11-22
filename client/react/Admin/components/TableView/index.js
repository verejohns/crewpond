import React from 'react';
import { withRouter } from 'react-router-dom';
import connect from 'react-redux/es/connect/connect';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { range } from 'lodash';
import cn from 'classnames';
import PropTypes from 'prop-types';

import PlacesAutocomplete, { geocodeByAddress,
    geocodeByPlaceId,
    getLatLng } from 'react-places-autocomplete';

import { Loader } from '../../../components'
import selectors from './selectors';
import actions from '../../actions';

class TableView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mainCategorySelected: null,
            subCategorySelected: null,
            distance: 0,
            keyword: '',
            limitLabel: [
                {label: '10', value: 10},
                {label: '20', value: 20},
                {label: '30', value: 30},
                {label: '40', value: 40},
                {label: '50', value: 50},
            ],
            limit: {label: '2', value: 2},
            orderBy: 'createdAt',
            filter_categories: [],
            address: '',
            location: JSON.parse(localStorage.getItem('user_location'))
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.selectTableLimit = this.selectTableLimit.bind(this);
    }

    componentDidMount() {
        const { limit, getCategories, tableHeader } = this.props;
        const { location } = this.state;

        this.setState({
            limit: limit
        });
        
        if(tableHeader !== "payments"){
            getCategories();

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
        }
    }

    handleChange = (address) => {
        if (!address) {
            this.setState({
                address,
                location: null
            });
        } else {
            this.setState({ address });
        }
    };

    handleSelect = (address) => {
        const { handleRecordSearch } = this.props;
        const { orderBy, limit, keyword, distance, filter_categories } = this.state;

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
            });

            handleRecordSearch({ orderBy, limit: limit, keyword, location: new_location, range: distance, categories: filter_categories });
        }).catch(error => console.error('Error', error));
    };

    handleInputChange = ({ target: { id, value } }) => {
        this.setState({
            [id]: value,
        });
    };

    handleKeyPress = (ev) => {
        if(ev.key === 'Enter'){
            this.handleSearch();
        }
    };

    handleSelectAll() {
        const { handleSelectAll } = this.props;
        handleSelectAll();
    };

    selectCategory = (type, value = null) => {
        const { categories, handleRecordSearch } = this.props;
        const { mainCategorySelected, orderBy, limit, keyword, distance, filter_categories, location } = this.state;
        let filter_category = [];
        if (type === 'main') {
            if (mainCategorySelected !== value) {
                if(value){
                    const sub_filters = categories.filter(el=>el.main === value);
                    for(let id = 0; id < sub_filters[0].sub.length; id += 1){
                        filter_category.push({main: value, sub: sub_filters[0].sub[id]});
                    }
                }else{
                    filter_category = null;
                }
                this.setState({
                    mainCategorySelected: value,
                    subCategorySelected: null,
                    filter_categories: filter_category
                });
            }
        } else if (type === 'sub') {
            if(!value){
                const sub_filters = categories.filter(el=>el.main === mainCategorySelected);
                for(let id = 0; id < sub_filters[0].sub.length; id += 1){
                    filter_category.push({main: mainCategorySelected, sub: sub_filters[0].sub[id]});
                }
            } else {
                filter_category.push({main: mainCategorySelected, sub: value});
            }

            this.setState({
                subCategorySelected: value,
                filter_categories: filter_category
            });
        }

        handleRecordSearch({ orderBy, limit: limit, keyword, location: location, range: distance, categories: filter_category });
    };

    selectTableLimit = (opt) => {
        this.setState({
            limit: opt
        })
    };

    handleSearch = () => {
        const { handleRecordSearch } = this.props;
        const { orderBy, limit, keyword, distance, filter_categories, location } = this.state;

        handleRecordSearch({ orderBy, limit: limit, keyword, location: location, range: distance, categories: filter_categories });
    };

    render() {
        const { columns, tableBody, tableHeader, total, placeholder, selectAll, selectEnable, limitEnable, loading,action_buttons, page, isPagination, hasMore, isCategoriesLoaded, categories } = this.props;
        const { keyword, limit, orderBy, mainCategorySelected, subCategorySelected, distance, filter_categories, address, location } = this.state;
        const categorySelected = categories.filter(item => {
            return item.main === mainCategorySelected
        })[0];

        const TableHeader = () => {
            const tableHeader = columns.map((column, key) => (
                <th key={key} className={column.toLowerCase()}>{column==='select'?<input type="checkbox" checked={selectAll} onChange={this.handleSelectAll}></input>:column}</th>
            ));

            return (
                <thead>
                    <tr>{tableHeader}</tr>
                </thead>

            );
          };

          const TablePagination = (props) => {
            const { total, limit, page } = props;
            const numberOfPages = Math.ceil(total / limit) || 1;

            if (numberOfPages === 1) {
              return null;
            }

            const paginationContent = range(1, numberOfPages + 1).map((offset) => {
                const active = offset === page;
                return (
                    <div key={offset} className={cn('page-item', { active })}>
                        <button className="page-link" onClick={() => this.props.onPagination({offset, orderBy, limit, keyword, location: location, range: distance, categories: filter_categories})}>{offset}</button>
                    </div>
                );
            });

            return (
              <div className="d-flex table-pagination">
                {paginationContent}
              </div>
            );
        }

        const searchOptions = {
            componentRestrictions: { country: ['au'] }
        }

        return (
            <div className="animated fadeIn">
                <Card>
                {tableHeader !== "payments"?
                    <CardHeader>
                        <div className="table-header">
                            <div className="search-wrapper">
                                <div className="top">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <img src="/static/images/icons/icon-search.svg" alt="" />
                                        </div>

                                        <input type="text" id="keyword" className="form-control" placeholder="Search ..." value={keyword} onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} />
                                    </div>
                                    <button className="btn btn-icon btn-default collapsed" data-toggle="collapse" data-target=".filter-card" aria-expanded="false" aria-controls="filter-card">
                                        <img src="/static/images/icons/icon-filter-border.svg" alt="" />
                                    </button>
                                </div>

                                <div className="collapse filter-card">
                                    <div className="card card-body">
                                        {!isCategoriesLoaded ?
                                            <Loader />
                                            :
                                            <div className="row">
                                                <div className="col-12 mb-2">
                                                    <h5>Categories</h5>
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
                                                                {categories.map((item) => {
                                                                    return (
                                                                        <span key={item.id} className={`item${mainCategorySelected === item.main ? ' active' : ''}`} onClick={() => this.selectCategory('main', item.main)}>
                                                                            {item.main}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </PerfectScrollbar>
                                                        {mainCategorySelected && categorySelected && categorySelected.sub &&
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
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <h5 className="mb-0">Location</h5>
                                                    <label className="small">Search within {distance} km</label>
                                                    <input type="range" id="distance" className="custom-range" value={distance} onChange={this.handleInputChange} onMouseUp={this.handleSearch} onTouchEnd={this.handleSearch}/>
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
                        </div>
                        {action_buttons}                        
                    </CardHeader>:null}
                    <CardBody>
                    <Table responsive bordered>
                        <TableHeader/>
                        <tbody>
                            {tableBody}
                        </tbody>

                    </Table>
                    {isPagination?<TablePagination total={total} limit={limit} page={page}/>:
                    (hasMore?
                    <div className="table-load-bar">
                        <div className="load-more-button" onClick={() => this.props.onPagination({page, limit:limit})}>
                            Loade More
                        </div>
                    </div>:null)}
                    </CardBody>
                </Card>
            </div>
        );
    }
};

TableView.defaultProps = {
    columns: [],
    total: 0,
    tableHeader: 'Table',
    placeholder: 'Search Item',
    selectAll: false,
    selectEnable: true,
    limitEnable: false,
    loading: false,
    isPagination: true,
    hasMore: false,
    limit: 10,
    action_buttons: null
};

TableView.propTypes = {
    hasMore: PropTypes.bool,
    total: PropTypes.number.isRequired,
    handleRecordSearch: PropTypes.func,
    handleSelectAll: PropTypes.func,
    onPagination: PropTypes.func,
    selectAll: PropTypes.bool.isRequired,
    columns: PropTypes.array.isRequired,
    tableBody: PropTypes.array.isRequired,
    placeholder: PropTypes.string,
    tableHeader: PropTypes.string,
    selectEnable: PropTypes.bool.isRequired,
    limitEnable: PropTypes.bool.isRequired,
    limit: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    isPagination: PropTypes.bool.isRequired,

    //from reducer
    getCategories: PropTypes.func.isRequired,
    isCategoriesLoaded: PropTypes.bool.isRequired,
    categories: PropTypes.array.isRequired,

    action_buttons: PropTypes.object,
};

export default connect(
    selectors,
    {
        ...actions.category,
    }
)(withRouter(TableView));
