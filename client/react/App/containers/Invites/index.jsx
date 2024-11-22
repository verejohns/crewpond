import React, { Component } from "react";
import PropTypes from "prop-types";
import {toast} from "react-toastify";
import connect from 'react-redux/es/connect/connect';

import {PageHeader, Loader, InviteCard, Slider, InviteDetail} from "../../components";
import { constant, messages, paths } from "../../../../../utils";
import selectors from './selectors';
import actions from '../../actions';

class Invites extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            invites: [],
            inviteSelected: null
        };
        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    componentDidMount() {
        this.loadInvites(false);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location !== prevProps.location) {
            this.getSelectedInviteId();
        }

        if(this.props.badgeCount !== prevProps.badgeCount) {
            if(this.props.badgeCount.invite_count !== prevProps.badgeCount.invite_count) {
                this.loadInvites(false);
            }
        }
    }

    componentWillUnmount() {
        if (this.hasScrollListener) {
            window.removeEventListener("scroll", this.loadMore);
            this.hasScrollListener = false;
        }
    }

    getSelectedInviteId = () => {
        const { location: { search } } = this.props;
        const inviteId = (new URLSearchParams(search)).get("inviteId");
        this.setState({inviteSelected: inviteId});
    }

    loadInvites = (isLoadMore) => {
        const { getReceivedInvites } = this.props;
        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
        };
        if (this.lastValue)
            params.lastValue = this.lastValue;

        getReceivedInvites(null).then(({ result: { data } }) => {
            let { invites } = this.state;
            if(isLoadMore)
                invites = invites.concat(data.invites);
            else 
                invites = data.invites;
            this.lastValue = data.lastValue;
            this.setState({ invites }, () => {
                if (data.invites.length > 0 && data.invites.length >= this.limit) {
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
            this.loadInvites(isLoadMore);
        }
    };

    selectInvite = (id) => {
        const { history: {push} } = this.props;
        if(id) 
            push(`${paths.client.APP_INVITES}?inviteId=${id}`);
        else
            push(paths.client.APP_INVITES);
    };

    updateInvite = (isAccepted, id) => {
        const {declineInvite, getBadgeCount} = this.props;
        const {invites} = this.state;
        if(!isAccepted)
            declineInvite(id)
            .then(({result: {data}}) => {
                const {result} = data;
                if(result === 'success') {
                    this.setState({invites: invites.filter(el=>el.id != id)});
                    getBadgeCount();
                }
            }).catch(() => {
                toast.error(message.INTERNAL_SERVER_ERROR);
            })
        else {
            const { invites } = this.state;
            this.setState({invites: invites.filter(el=>el.id != id)});
            getBadgeCount();
        }
    }

    render() {
        const { isLoading, history } = this.props;
        const { invites, inviteSelected } = this.state;
        let content;

        if (!isLoading && invites.length === 0) {
            content = (
                <h3 className="text-center">
                    {messages.NO_DATA}
                </h3>
            )
        } else {
            content = (
                <div className="row">
                    {invites.map((item) => {
                        return (
                            <div className="col-12 mb-3" key={item.id}>
                                <InviteCard
                                    history={history}
                                    key={item.id}
                                    data={item}
                                    onClick={() => this.selectInvite(item.id)}
                                    updateInvite={this.updateInvite}
                                    selected={item.id === inviteSelected}
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
                <PageHeader type="invites" />

                <div className="page-content">
                    <div className="container">
                        {content}
                    </div>
                </div>
                {inviteSelected && (
                    <Slider
                        onUnmount={() => this.selectInvite(null)}
                    >
                        <InviteDetail
                            history={history}
                            id={inviteSelected}
                        />
                    </Slider>
                )}
            </React.Fragment>
        );
    }
}

Invites.propTypes = {
    getInvites: PropTypes.func.isRequired,
    getReceivedInvites: PropTypes.func.isRequired,
    badgeCount: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    declineInvite: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors,
    { 
        ...actions.invites,
        ...actions.settings,
        ...actions.notifications
    }
)(Invites);
