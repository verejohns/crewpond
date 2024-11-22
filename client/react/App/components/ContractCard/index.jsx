import React, { Component } from "react";
import moment from "moment";
import PropTypes from "prop-types";

class ContractCard extends Component {
    render() {
        const { data, onClick, selected, user } = this.props;
        const isHirer = data.hirer.id === user.id;
        let avatar = data.hirer.avatar;
        return (
            <div className={`card contract-card${selected ? ' active' : ''}`} onClick={onClick}>
                <div className="card-body">
                    <div className="left-wrapper">
                        <div className={"avatar" + (!avatar? ' no-border' : '')}>
                            <img src={avatar?avatar:'/static/images/job_avatar.png'} alt="" />
                        </div>
                        {((!isHirer && data.read_jobber === false) || (isHirer && data.read_hirer === false))?<div className="badge-count"/>:null}
                    </div>
                    <div className="right-wrapper">
                        <h5 className="title">{data.job.title}</h5>
                        <div className="poster">
                            <span>{`${data.hirer.first_name} ${data.hirer.last_name}`}</span>
                            {data.hirer.company && (
                                <React.Fragment>
                                    <span />
                                    <span className="company">{data.hirer.company}</span>
                                </React.Fragment>
                            )}
                        </div>
                        <div className="started-at">
                            <span>Due date:</span>
                            <span>{moment(data.job.due_date).format('DD / MM / YY')}</span>
                        </div>
                        <div className="footer">
                            <div className="item">
                                <img className="mr-2" src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                <span>{data.job.price ? `$${data.job.price}${data.job.is_hourly && '/h'}` : `-`}</span>
                            </div>
                            <div className="ml-auto">
                                {data.job.is_completed && (
                                    <span className="badge badge-dark ml-2">Completed</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ContractCard.defaultProps = {
    selected: false
};

ContractCard.propTypes = {
    data: PropTypes.object,
    user: PropTypes.object,
    onClick: PropTypes.func,
    selected: PropTypes.bool.isRequired
};

export default ContractCard;
