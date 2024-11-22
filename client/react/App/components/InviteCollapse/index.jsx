import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from 'moment';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { constant, time } from '../../../../../utils';

import { Collapse } from 'reactstrap';
import { Score } from '../../../components';

class InviteCollapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse: false,
            isOpen: false
        };

        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    render() {
        const { invite, isHirerView } = this.props;
        const { collapse } = this.state;
        TimeAgo.addLocale(en)
        const rate = 100 * parseInt(invite.receiver.review.number_of_success) / parseInt(invite.receiver.review.number_of_feedback);
        return (
            <div className="jobber-collapse">
                <div className="jobber-info" style={{backgroundColor: this.authUser.id === invite.receiver.id?"#E7EFF2":"#FFFFFF"}} onClick={()=>this.setState({collapse: !this.state.collapse})}>
                    <div className={"jobber-row"}>
                        <div className={"avatar" + (!invite.receiver.avatar?" no-border":"")}>
                            <img src={invite.receiver.avatar?invite.receiver.avatar:'/static/images/avatar.png'} alt="" />
                        </div>
                        <div className="left-wrapper">
                            <div className="name">{invite.receiver.first_name} {invite.receiver.last_name}</div>
                            <Score score={invite.receiver.review.score} />
                            <div className="rate">
                                {invite.receiver.review.number_of_feedback === '0' ?
                                    'No ' : `${(rate % 1 === 0 ?rate:rate.toFixed(2))}% `
                                }
                                Completion rate
                            </div>
                        </div>
                        <div className="right-wrapper">
                            <div className="company">{invite.receiver.company}</div>
                            <div className="hired-at">{moment(invite.createdAt).fromNow()}</div>
                            <div className="schedule-deetail">
                                {invite.schedules.map((item, key) => {
                                    return (
                                        <span style={{fontSize: "12px"}} key={key}>{(item.name?item.name:"") + (invite.schedules.length - 1 === key?"":", ")}</span>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                {isHirerView === true?<Collapse isOpen={collapse}>
                    {invite.schedules.map((item, key) => {
                        let min_time = item.time_field[0].from;
                        let max_time = item.time_field[0].to;
                        for(let i = 1; i < item.time_field.length; i += 1) {
                            if(time.compareDate(item.time_field[i].from, min_time)){
                                min_time = item.time_field[i].from;
                            }
                            if(time.compareDate(max_time, item.time_field[i].to)){
                                max_time = item.time_field[i].to;
                            }
                        }
                        return (
                            <div className="schedule-info" key={key}>
                                <div className="indicator">
                                    <img src="/static/images/icons/icon-oval-green.svg" alt="" />
                                </div>
                                <div className="left-wrapper">
                                    <div className="name">{item.name}</div>
                                    <span>{moment(min_time).format("DD/MM/YYYY") + "~" + moment(max_time).format("DD/MM/YYYY")}</span>
                                </div>
                            </div>
                        )
                    })}
                </Collapse>:null}
            </div>   
        );
    }
}

InviteCollapse.defaultProps = {
    isHirerView: false
};

InviteCollapse.propTypes = {
    isHirerView: PropTypes.bool.isRequired,
    invite: PropTypes.object.isRequired
};
export default InviteCollapse;
