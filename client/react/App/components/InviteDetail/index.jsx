import React, { Component } from "react";
import { Link } from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import moment from "moment";
import PropTypes from "prop-types";

import { Loader, Score } from "../../../components";
import selectors from "./selectors";
import actions from "../../actions";
import ScheduleItem from "../ScheduleItem";

class InviteDetail extends Component {
    componentDidMount() {
        const { id, getInviteById } = this.props;

        getInviteById(id);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { id, getInviteById } = this.props;

        if (nextProps.id !== id) {
            getInviteById(nextProps.id);
        }
    }

    render() {
        const { isLoading, invite, history } = this.props;

        if (isLoading || !invite) {
            return (
                <Loader />
            );
        }

        return (
            <div className="detail-container">
                <div className="slider-header status">
                    <span className="active">Open</span>
                    <span className={invite.job.is_assigned ? "active" : null}>Assigned</span>
                    <span className={invite.job.is_completed ? "active" : null}>Completed</span>
                </div>

                <section>
                    <div className="flex-wrapper">
                        <div className="left-wrapper">
                            <div className="category">
                                <span>Category: </span>
                                <span>{invite.job.category.sub}</span>
                            </div>
                            <h5>{invite.job.title}</h5>
                        </div>

                        <div className="right-wrapper">
                            {!invite.job.is_public && (
                                <span className="badge badge-dark">Private</span>
                            )}
                            {invite.job.is_urgent && (
                                <span className="badge badge-danger">SOS</span>
                            )}
                        </div>
                    </div>
                    <div className="description">{invite.job.description}</div>
                </section>

                <section>
                    <div className="jobber-row">
                        <div className={"avatar" + (!invite.job.user.avatar?" no-border":"")}>
                            <img src={invite.job.user.avatar?invite.job.user.avatar:'/static/images/avatar.png'} alt="" />
                        </div>
                        <div className="left-wrapper">
                            <div className="name">{invite.job.user.first_name} {invite.job.user.last_name}</div>
                            {invite.job.user.company && (
                                <div className="company">{invite.job.user.company}</div>
                            )}
                            <Score score={invite.job.user.score} />
                        </div>
                        <div className="right-wrapper">
                            <Link to={"/app/jobber/profile/" + invite.job.user.id} className="link-green mt-auto">View Profile</Link>
                        </div>
                    </div>
                </section>

                {invite.job.schedules.length > 0 && (
                    <section>
                        <h5>Schedules</h5>

                        <div className="schedule-list">
                            <div className="row">
                                {invite.job.schedules.map(item => {
                                    return (
                                        <div className="col-md-6">
                                            <ScheduleItem
                                                jobId={invite.job.id}
                                                data={item}
                                                history={history}
                                                isOwner={false}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {invite.job.assignees.length > 0 && (
                    <section>
                        <h5>Assigned ({invite.job.assignees.length})</h5>

                        {invite.job.assignees.map(item => {
                            return (
                                <div className="jobber-row">
                                    <div className={"avatar" + (!item.jobber.avatar?" no-border":"")}>
                                        <img src={item.jobber.avatar?item.jobber.avatar:'/static/images/avatar.png'} alt="" />
                                    </div>
                                    <div className="left-wrapper">
                                        <div className="name">{item.jobber.first_name} {item.jobber.last_name}</div>
                                        <Score score={item.jobber.score} />
                                        <div className="rate">
                                            {item.jobber.number_of_feedback === '0' ?
                                                'No ' : `${100 * parseInt(item.jobber.number_of_success) / parseInt(item.jobber.number_of_feedback)}% `
                                            }
                                            Completion rate
                                        </div>
                                    </div>
                                    <div className="right-wrapper">
                                        {item.jobber.company && (
                                            <div className="company">{item.jobber.company}</div>
                                        )}
                                        <div className="hired-at">{moment(item.contract.createdAt).fromNow()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}
            </div>
        );
    }
}

InviteDetail.propTypes = {
    id: PropTypes.number.isRequired,
    invite: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    getInviteById: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors,
    { ...actions.invites }
)(InviteDetail);
