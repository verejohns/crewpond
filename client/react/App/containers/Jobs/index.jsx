import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import selectors from "./selectors";
import actions from "../../actions";
import { messages, paths, constant } from "../../../../../utils";

import { PageHeader, JobCard, Loader, JobDetail, Slider, ConfirmDialog } from "../../components";
import { toast } from "react-toastify";

class Jobs extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            jobs: [],
            jobSelected: null,
            isOwner: false,
            deleteJobId: null,
            isOpen: false,
            isJobDetail: false
        };
        this.limit = 10;
        this.orderBy = "id";
        this.lastValue = null;
        this.hasScrollListener = false;

        this.onEditJob = this.onEditJob.bind(this);
        this.onCloseJob = this.onCloseJob.bind(this);
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    componentDidMount() {
        this.getSelectedJobId();
        this.loadJobs();
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
        const {updateSearchParams} = this.props;
        updateSearchParams({ keyword: "", range: 0, location: null, categories: null });
        if (this.hasScrollListener) {
            window.removeEventListener("scroll", this.loadMore);
            this.hasScrollListener = false;
        }
    }

    loadJobs = () => {
        const { getJobs, searchParams } = this.props;

        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
            ...searchParams
        };
        if (this.lastValue)
            params.lastValue = this.lastValue;

        getJobs(params).then(({ result: { data } }) => {
            let { jobs } = this.state;

            jobs = jobs.concat(data.jobs);
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
        });
    };

    loadMore = () => {
        const { isLoading } = this.props;

        if (!isLoading && window.scrollY + window.innerHeight >= document.body.clientHeight) {
            this.loadJobs();
        }
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
            toast.error("Failed to close job.");
        });
        this.setState({
            deleteJobId: null,
            isOpen: false
        })
    }

    onCancelJob = () => {
        this.setState({
            deleteJobId: null,
            isOpen: false
        })
    }

    selectJob = (id) => {
        const { history: { push } } = this.props;
        if(id)
            push(`${paths.client.APP_JOBS}?jobId=${id}`);
        else 
            push(paths.client.APP_JOBS);

        let { jobs } = this.state;
        const index = jobs.findIndex(el=>el.id == id);
        if(index > -1) {
            jobs[index].has_updates = false;
        }
        this.setState({
            jobs,
            jobSelected: id
        });
    }

    getSelectedJobId = () => {
        const { location: { search } } = this.props;
        const jobId = (new URLSearchParams(search)).get("jobId");
        const notification = (new URLSearchParams(search)).get("notification");
        if(notification === 'jobDetail'){
            this.setState({isJobDetail: true});
        }
        this.setState({jobSelected: jobId});
    }

    render() {
        const { isLoading, history } = this.props;
        const { jobs, jobSelected, isOwner, isOpen, isJobDetail } = this.state;
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
                    {isLoading ?
                        <div className="col-12 mt-5">
                            <Loader />
                        </div> : null
                    }
                </div>
            );
        }

        if(!isJobDetail) {
            return (
                <React.Fragment>
                    <PageHeader type="all_jobs" />
                    <ConfirmDialog  isOpen={isOpen} description={"Are you sure you want to cancel the job post?"} subDescription={"Note: Cancelling this job post does not cancel any running contracts associated with this post. To close a contact, go to your contracts tab."} ok="Yes" cancel="No" onOk={this.handleCloseConfirm} onCancel={this.onCancelJob}/>
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
                                id={jobSelected} history={history} isOwner={isOwner}
                            />
                        </Slider>
                    )}
                </React.Fragment>
            );    
        }else {
            return (
                <div className="card detail-card">
                    <div className="card-body">
                        <JobDetail
                            id={jobSelected} history={history} isOwner={isOwner}
                        />
                    </div>
                </div>
            )
        }
    }
}

Jobs.propTypes = {
    getJobs: PropTypes.func.isRequired,
    closeJob: PropTypes.func.isRequired,
    updateSearchParams: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
    isLoading: PropTypes.bool.isRequired,
    searchParams: PropTypes.object.isRequired,
};

export default connect(
    selectors,
    {
         ...actions.jobs,
         ...actions.settings
    }
)(Jobs);
