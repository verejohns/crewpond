import React, { Component } from "react";
import moment from "moment";
import PropTypes from "prop-types";

class OfferCard extends Component {
    render() {
        const { data, onClick, selected } = this.props;
        let avatar = null;
        if(data.job && data.job.avatar) 
            avatar = data.job.avatar;
        else if(data.hirer && data.hirer.avatar)
            avatar = data.hirer.avatar;
        return (
            <div className={`card offer-card${selected ? ' active' : ''}`} onClick={onClick}>
                <div className="card-body">
                    <div className="left-wrapper">
                        <div className={"avatar" + (!avatar? ' no-border' : '')}>
                            <img src={avatar?avatar:"/static/images/job_avatar.png"} alt="" />
                        </div>
                        {data.read_offer === false?<div className="badge-count"/>:null}
                    </div>
                    <div className="right-wrapper">
                        <div className="category">
                            <span>Category: </span>
                            <span>{data.job.category.sub}</span>
                        </div>
                        <h5 className="title">{data.job.title}</h5>
                        {data.hirer?
                        <div className="poster">
                            <span>{`${data.hirer.first_name} ${data.hirer.last_name}`}</span>
                            {data.hirer.company && (
                                <React.Fragment>
                                    <span />
                                    <span className="company">{data.hirer.company}</span>
                                </React.Fragment>
                            )}
                        </div>:null}
                        <div className="footer">
                            <div className="item">
                                <img src="/static/images/icons/icon-clock-green.svg" alt="" />
                                <span>{data.due_date ? moment(data.due_date).format('DD/MM/YYYY') : '-'}</span>
                            </div>
                            <div className="item">
                                <img src="/static/images/icons/icon-dollar-coin-stack-green.svg" alt="" />
                                <span>{data.price ? `$${data.price}${data.is_hourly ? '/h' : ''}` : `-`}</span>
                            </div>
                            <div className="sent-at">{moment(data.createdAt).fromNow()}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

OfferCard.defaultProps = {
    selected: false
};

OfferCard.propTypes = {
    data: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool.isRequired
};

export default OfferCard;
