import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from 'react-redux/es/connect/connect';
import selectors from './selectors';
import actions from '../../actions';
import { constant, messages, paths } from "../../../../../utils";
import { merge } from 'lodash';

import { PageHeader, Loader, JobberCard, ScheduleDialog } from "../../components";
import { toast } from "react-toastify";

class InviteRequest extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            jobbers: [],
            invites: [],
            jobId: null,
            isOpen: false,
            isAllJobbers: true
        };
        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    componentDidMount() {
        this.loadJobbers();
        // this.loadInvites();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.searchParams !== prevProps.searchParams) {
            this.lastValue = null;

            if (this.hasScrollListener) {
                window.removeEventListener("scroll", this.loadMore);
                this.hasScrollListener = false;
            }
            this.setState({
                jobbers: []
            }, this.loadJobbers);
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

    loadInvites = () => {
        const {location: {search}, getInvites} = this.props;
        const urlParams = new URLSearchParams(search);
        const job_id = urlParams.get('jobId');

        this.setState({
            jobId: job_id
        });
        getInvites({job_id})
        .then(({result: {data}}) => {
            this.setState({
                invites: data.invites
            });
        })
    }

    loadJobbers = () => {
        const { getUsers, getFavoriteUsers, searchParams } = this.props;
        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
            lastValue: this.lastValue,
            ...searchParams
        };
        
        if(searchParams.is_favorite) {
            getFavoriteUsers(params).then(({ result: { data } }) => {
                let { jobbers } = this.state;
                let users = data.users;

                for(let i = 0; i < jobbers.length; i += 1) {
                    users = users.filter(el=>el.email !== jobbers[i]);
                }
                jobbers = jobbers.concat(users);

    
                this.lastValue = data.lastValue;
                this.setState({ jobbers }, () => {
                    if (data.users.length > 0 && data.users.length >= this.limit) {
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
        }else {
            getUsers(params).then(({ result: { data } }) => {
                let { jobbers } = this.state;
                let users = data.users;

                for(let i = 0; i < jobbers.length; i += 1) {
                    users = users.filter(el=>el.email !== jobbers[i]);
                }
                jobbers = jobbers.concat(users);
    
                this.lastValue = data.lastValue;
                this.setState({ jobbers }, () => {
                    if (data.users.length > 0 && data.users.length >= this.limit) {
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
        }
    };

    loadMore = () => {
        const { isLoading } = this.props;

        if (!isLoading && window.scrollY + window.innerHeight >= document.body.clientHeight) {
            this.loadJobbers();
        }
    };

    selectInvite = (invite) => {
        let { jobbers } = this.state;
        const index = jobbers.findIndex(el=>el.id === invite.id);
        merge(jobbers[index], {
            status: jobbers[index].status?false:true
        });
        this.setState({jobbers});  
    };

    showScheduleDialog = () => {
        const { location: {search} } = this.props;
        const urlParams = new URLSearchParams(search);
        let { jobbers } = this.state;
        let receiver_ids = [];
        for(let i = 0; i < jobbers.length; i += 1) {
            if(jobbers[i].status)
                receiver_ids.push(jobbers[i].id);
        }
        if(receiver_ids.length === 0) {
            toast.warning("Please select jobbers to send invite.");
            return;
        }
        
        const jobId = urlParams.get('jobId');
        this.setState({jobId, isOpen: true});
    }

    handleFavorite = (data) => {
        const {favoriteJobber} = this.props;
        favoriteJobber({
            to_user_id: data.id,
            is_favorite: !data.is_favorite
        }).then(() => {
            const jobbers = [ ...this.state.jobbers ];

            for (let i = 0; i < jobbers.length; i ++) {
                if (jobbers[i].id === data.id) {
                    jobbers[i].is_favorite = !data.is_favorite;
                    break;
                }
            }

            this.setState({ jobbers });
        }).catch((err) => {
            console.error(err);
            toast.error("Failed to favorite jobber.")
        });

    }

    handleSendInvite = (schedules) => {
        const { createInvite, history: {push}, location: {search} } = this.props;
        let { jobbers } = this.state;
        const urlParams = new URLSearchParams(search);
        const jobId = urlParams.get('jobId');
        let receiver_ids = [];
        for(let i = 0; i < jobbers.length; i += 1) {
            if(jobbers[i].status)
                receiver_ids.push(jobbers[i].id);
        }

        createInvite({job_id: jobId, receiver_ids, schedule_ids: schedules})
        .then(() => {
            push(`${paths.client.APP_BASE}?jobId=${jobId}`);
        }).catch(() => {
            this.setState({
                selectedJobber: null
            });
    
            toast.error(messages.INTERNAL_SERVER_ERROR);
        })
    }

    render() {
        const { isLoading, history } = this.props;
        const { jobbers, invites, jobId, isOpen, isAllJobbers } = this.state;
        let content;

        if (!isLoading && jobbers.length === 0) {
            content = (
                <h3 className="text-center">
                    {messages.NO_DATA}
                </h3>
            )
        } else {
            content = (
                <div className="row">
                    {jobbers.map((item) => {
                        const invite = invites.find((el) => {
                            if(el.receiver_id === item.id){
                                return true;
                            }else 
                                return false;
                        });
                        if(invite){
                            merge(item, {
                                status: true
                            });
                        }
                        
                        return (
                            <div className="col-12 mb-3">
                                <JobberCard
                                    key={item.id}
                                    data={item}
                                    jobId={jobId}
                                    history={history}
                                    favoriteJobber={this.handleFavorite}
                                    onInvite={(invite) => this.selectInvite(invite)}
                                    declineInvite={this.declineInvite}
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

        return (
            <React.Fragment>
                <PageHeader type="invites_request" onSendInvite={this.showScheduleDialog}/>
                {isOpen?<ScheduleDialog isOpen={isOpen} jobId={jobId} handleClose={()=>this.setState({isOpen: false})} sendInvite={this.handleSendInvite}/>:null}
                <div className="page-content">
                    <div className="container">
                        {content}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

InviteRequest.propTypes = {
    getUsers: PropTypes.func,
    getFavoriteUsers: PropTypes.func,
    getInvites: PropTypes.func,
    createInvite: PropTypes.func,
    jobId: PropTypes.number.isRequired,
    favoriteJobber: PropTypes.func,
    searchParams: PropTypes.object.isRequired,
    updateSearchParams: PropTypes.object.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors,
    { 
        ...actions.jobs,
        ...actions.users,
        ...actions.invites,
        ...actions.favorite
    }
)(InviteRequest);
