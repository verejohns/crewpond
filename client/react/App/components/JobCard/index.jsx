import React, { Component } from "react";
import PropTypes from "prop-types";
import { constant } from '../../../../../utils';
import moment from 'moment';
import GoogleMapReact from 'google-map-react';
const AnyReactComponent = () => <span class="fa fa-map-marker" aria-hidden="true"></span>;
import { Modal, ModalBody } from "reactstrap";

class JobCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpenMap: false,
            latitude: -33.865143,
            longitude: 151.209900,
            defaultZoom: 11
        };

        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    onCloseJob = (ev) => {
        ev.stopPropagation();
        const {onCloseJob, data} = this.props;
        onCloseJob(data.id)
    }

    onEditJob = (ev) => {
        ev.stopPropagation();
        const {onEditJob, data} = this.props;
        onEditJob(data.id);
    }

    openMap = (ev) => {
        if (this.props.data.location) {
            ev.stopPropagation();
            this.setState({isOpenMap: true});
        }
    }

    renderMapModal() {
        const { defaultZoom, latitude, longitude, isOpenMap } = this.state;
        const { data } = this.props;
        
        return (
            <Modal isOpen={isOpenMap} className="map-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={() => this.setState({isOpenMap: false})}/>
                </div>

                <ModalBody>
                    <div className="map-container-job-detail">
                        <GoogleMapReact
                            apiKey={process.env.GOOGLE_API_KEY}
                            center={[data.location ? data.location.latitude : latitude, data.location ? data.location.longitude : longitude]}
                            zoom={defaultZoom}

                        >
                            <AnyReactComponent
                                lat={data.location ? data.location.latitude : latitude}
                                lng={data.location ? data.location.longitude : longitude}
                            />
                        </GoogleMapReact>
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    render() {
        const { data, onClick, selected } = this.props;
        let avatar = null;
        if(data.avatar) {
            avatar = data.avatar;
        }else if(data.user.avatar) {
            avatar = data.user.avatar;
        }

        return (
            <div className={`card job-card${selected ? ' active' : ''}`} onClick={onClick}>
                {this.renderMapModal()}
                <div className="card-body">
                    <div className="left-wrapper">
                        <div className={"avatar" + (!avatar? ' no-border' : '')}>
                            <img src={avatar?avatar:'/static/images/job_avatar.png'} alt="" />
                        </div>
                        {data.has_updates?<div className="badge-count"/>:null}
                    </div>
                    <div className="right-wrapper">
                        <div className="header">
                            <div className="category">
                                <span>Category: </span>
                                <span>{data.category.sub}</span>
                            </div>
                            <div className="d-flex flex-column ml-auto">
                                {data.editable?<div className="action">
                                    <img src="/static/images/icons/icon-delete-gray.svg" alt="" onClick={this.onCloseJob}/>
                                    <img src="/static/images/icons/icon-edit-gray.svg" alt="" onClick={this.onEditJob}/>
                                </div>:null}
                                <div className="ml-auto">
                                    {!data.is_public && (
                                        <span className="badge badge-dark ml-2">Private</span>
                                    )}
                                    {data.is_urgent && (
                                        <span className="badge badge-danger ml-2">SOS</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <h5 className="title">{data.title}</h5>
                        <div className="description">{data.description}</div>
                        <div className="footer">
                            <div className="row mt-1">
                                <div className="col-lg-6 col-12 d-flex flex-row posted-by">
                                    <span>Posted By: </span>
                                    <span>{data.user.first_name + " " + data.user.last_name}</span>
                                </div>
                                <div className="col-lg-6 col-12 d-flex flex-row posted-by">
                                    <span>Company: </span>
                                    <span>{data.user.company}</span>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 d-flex flex-row">
                                    <div className="item">
                                        <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                        <span>{data.due_date ? moment(data.due_date).format('DD/MM/YYYY') : '-'}</span>
                                    </div>
                                    <div className="item">
                                        <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                        <span>{data.price ? `$${data.price}${data.is_hourly ? '/h' : ''}` : `-`}</span>
                                    </div>
                                    <div className="item">
                                        <img src="/static/images/icons/icon-calendar-check.svg" alt="" />
                                        <span>{data.number_of_offers}</span>
                                    </div>
                                    <div className="item">
                                        <img src="/static/images/icons/icon-location-green.svg" alt="" />
                                        <span onClick={this.openMap}>{data.location ? data.location.place_name : 'Remote'}</span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

JobCard.defaultProps = {
    selected: false
};

JobCard.propTypes = {
    data: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    onEditJob: PropTypes.func,
    onCloseJob: PropTypes.func,
    selected: PropTypes.bool.isRequired
};

export default JobCard;
