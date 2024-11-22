import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from 'react-redux/es/connect/connect';
import selectors from './selectors';
import actions from '../../actions';
import { messages, paths, constant } from "../../../../../utils";
// import { messaging } from "../../utils/fcm/init";

import {toast} from "react-toastify";
import {PageHeader, JobCard, Loader, JobDetail, Slider, ConfirmDialog} from "../../components";

class Dashboard extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            jobs: [],
            jobSelected: null,
            isOpen: false,
            deleteJobId: null
        };
        this.limit = 10;
        this.orderBy = "id";
        this.lastValue = null;
        this.hasScrollListener = false;
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));

        this.onEditJob = this.onEditJob.bind(this);
        this.onCloseJob = this.onCloseJob.bind(this);
        this.onCancelJob = this.onCancelJob.bind(this);
    }

    componentDidMount() {
        const { location: { search }, history: { push } } = this.props;
        const successCode = (new URLSearchParams(search)).get("successCode");
        if (successCode) {
            if (successCode === '0') {
                toast.success(messages.ACCOUNT_VERIFIED);
            }

            return push(paths.client.APP_BASE);
        }
        this.registerFCM();
        this.getSelectedJobId();
        this.loadJobs();
    }

    registerFCM = () => {
        const { setFcmToken } = this.props;

        // messaging.requestPermission()
        // .then(async function() {
        //     const token = await messaging.getToken();
        //     setFcmToken({platform: "web", token});
        // })
        // .catch(function(err) {
        //     console.log("Unable to get permission to notify.", err);
        // });

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.searchParams !== prevProps.searchParams) {
            this.lastValue = null;

            if (this.hasScrollListener) {
                window.removeEventListener("scroll", this.loadMore);
                this.hasScrollListener = false;
            }
            this.setState({
                jobs: []
            }, this.loadJobs);
        }

        if (this.props.location !== prevProps.location) {
            this.getSelectedJobId();
        }
    }

    componentWillUnmount() {
        if (this.hasScrollListener) {
            window.removeEventListener("scroll", this.loadMore);
            this.hasScrollListener = false;
        }
    }

    getSelectedJobId = () => {
        const { location: { search } } = this.props;
        let { jobs } = this.state;
        const jobId = (new URLSearchParams(search)).get("jobId");
        const index = jobs.findIndex(el=>el.id == jobId);
        if(index > -1) {
            jobs[index].has_updates = false;
        }
        this.setState({
            jobSelected: jobId,
            jobs
        });
    }

    loadJobs = () => {
        const { getJobs, searchParams } = this.props;

        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
            onlySelf: true,
            ...searchParams
        };
        if (this.lastValue)
            params.lastValue = this.lastValue;
        getJobs(params).then(({ result: { data } }) => {
            
            let { jobs } = this.state;
            
            jobs = jobs.concat(data.jobs);
            //jobs = data.jobs;
            
            this.lastValue = data.lastValue;
            this.setState({ jobs }, () => {
                if (data.jobs.length > 0 && data.jobs.length >= this.limit) {
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
            if (this.hasScrollListener) {
                window.removeEventListener("scroll", this.loadMore);
                this.hasScrollListener = false;
            }
        });
    };

    loadMore = () => {
        const { isLoading } = this.props;

        if (!isLoading && window.scrollY + window.innerHeight >= document.body.clientHeight) {
            this.loadJobs();
        }
    };

    selectJob = (id) => {
        const { history: { push } } = this.props;
        if(id)
            push(`${paths.client.APP_BASE}?jobId=${id}`);
        else 
            push(paths.client.APP_BASE);
    };

    onEditJob(id) {
        const { history: {push}} = this.props;
        push(paths.build(paths.client.APP_EDIT_JOB, id));
    }

    onCloseJob(id) {
        this.setState({
            deleteJobId: id,
            isOpen: true
        })
    }

    handleCloseConfirm = () => {
        const { deleteJobId } = this.state;
        const { closeJob } = this.props;

        closeJob(deleteJobId)
        .then(() => {
            toast.success("Job post was closed successfully.");
            this.limit = 10;
            this.orderBy = "id";
            this.lastValue = null;
            this.loadJobs();
        }).catch(() => {
            toast.error("Failed to close job.")
        });
        this.setState({
            deleteJobId: null,
            isOpen: false
        })
    }

    onCancelJob() {
        this.setState({
            isOpen: false,
            deleteJobId: null,
        })
    }



    render() {
        const { isLoading, history } = this.props;
        const { jobs, jobSelected, isOpen } = this.state;
        let content;
        if (!isLoading && jobs.length === 0) {
            content = (
                <h3 className="text-center">
                    {messages.NO_DATA}
                </h3>
            )
        } else {
            content = (
                <div className="row">
                    {jobs.map((item, index) => {
                        return (
                            <div className="col-12 mb-3">
                                <JobCard
                                    key={index}
                                    data={item}
                                    onClick={() => this.selectJob(item.id)}
                                    selected={item.id === jobSelected}
                                    onEditJob={this.onEditJob}
                                    onCloseJob={this.onCloseJob}
                                />
                            </div>
                        );
                    })}
                    {isLoading && (
                        <div className="col-12 mt-5">
                            <Loader />
                        </div>
                    )}
                </div>
            );
        }

        return (
            <React.Fragment>
                <PageHeader type="my_jobs" />
                <ConfirmDialog isOpen={isOpen} description={"Are you sure you want to cancel the job post?"} subDescription={"Note: Cancelling this job post does not cancel any running contracts associated with this post. To close a contact, go to your contracts tab."} ok="Yes" cancel="No" onOk={this.handleCloseConfirm} onCancel={this.onCancelJob}/>
                <div className="page-content">
                    <div className="container">
                        {content}
                    </div>
                </div>
                {jobSelected && (
                    <Slider
                        onUnmount={() => this.selectJob(null)}
                    >
                        <JobDetail
                            id={jobSelected} history={history}
                        />
                    </Slider>
                )}
            </React.Fragment>
        );
    }
}

Dashboard.propTypes = {
    getJobs: PropTypes.func.isRequired,
    closeJob: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    searchParams: PropTypes.object.isRequired,
    setFcmToken: PropTypes.func.isRequired,
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }).isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired
};

export default connect(
    selectors,
    { 
        ...actions.authentication,
        ...actions.jobs,
        ...actions.settings
    }
)(Dashboard);
