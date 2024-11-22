import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import PropTypes from "prop-types";
import selectors from "./selectors";
import actions from "../../actions";
import { messages, paths } from "../../../../../utils";

class Notifications extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            notifications: []
        };
        this.limit = 20;
        this.lastValue = null;
        this.orderBy = "id";
        this.onScroll = null;
    }

    componentDidMount() {
        this.fetchNotifications();
    }

    componentWillUnmount() {
        if (this.onScroll) {
            window.removeEventListener("scroll", this.onScroll);
            this.onScroll = null;
        }
    }

    fetchNotifications = () => {
        const { getNotifications } = this.props;
        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
        };
        if (this.lastValue)
            params.lastValue = this.lastValue;

        getNotifications(params).then(({ result: { data } }) => {
            let { notifications } = this.state;

            notifications = notifications.concat(data.notifications);
            this.lastValue = data.lastValue;
            this.setState({ notifications }, () => {
                if (data.notifications.length >= this.limit) {
                    if (!this.onScroll) {
                        this.onScroll = () => {
                            const { isLoading } = this.props;

                            if (!isLoading && window.scrollY + window.innerHeight >= document.body.clientHeight) {
                                this.fetchNotifications();
                            }
                        }
                        window.addEventListener('scroll', this.onScroll);
                    }
                } else if (this.onScroll) {
                    window.removeEventListener("scroll", this.onScroll);
                    this.onScroll = null;
                }
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    };

    handleClick = (item) => {
        const { history: {push} } = this.props;
        if(item.type === 5 || item.type === 6 || item.type === 7 || item.type === 8 || item.type === 25) {
            push(`${paths.client.APP_JOBS}?jobId=${item.job_id}&notification=jobDetail`);
        }else if(item.type === 9 || item.type === 10 || item.type === 11 || item.type === 26) {
            push(`${paths.client.APP_OFFERS}?offerId=${item.offer_id}&notification=offerDetail`);
        }else if((item.type >= 12 && item.type <= 17) || item.type === 24) {
            push(`${paths.client.APP_CONTRACTS}?contractId=${item.contract_id}&notification=contractDetail`);
        }else if(item.type === 22 || item.type === 23) {
            push(`${paths.client.APP_SCHEDULE}?viewMode=week&jobId=${item.job_id}`);
        }
    }

    render() {
        const { notifications } = this.state;

        return (
            <React.Fragment>
                <div className="page-content">
                    <div className="container">
                        {notifications.map(item => {

                            if(!item.sender)
                                return null;
                            
                            if (item.sender.avatar && (item.sender?.avatar.indexOf('https://') < 0)) {
                                
                                if (item.sender.avatar.split('')[0] !== '/') {
                                     item.sender.avatar = "/" + item.sender.avatar
                                }
                            }

                            return (
                                <div className="notification-row" onClick={() => this.handleClick(item)}>
                                    <div className="avatar">
                                        <img src={item.sender&&item.sender.avatar?item.sender.avatar:"/static/images/avatar.png"} alt={item.sender&&item.sender.avatar?item.sender.avatar:"/static/images/avatar.png"} />
                                    </div>
                                    <div className="detail">
                                        <div className="heading">
                                            <span className="sender">{item.sender.first_name} {item.sender.last_name}</span>
                                            <span className="sent-at">{moment(item.createdAt).format("MMM DD")}</span>
                                        </div>
                                        <div className="description">
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

Notifications.propTypes = {
    getNotifications: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
      }).isRequired,
};

export default connect(
    selectors,
    { ...actions.notifications }
)(Notifications);
