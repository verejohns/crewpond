import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import PropTypes from "prop-types";

import selectors from "./selectors";
import actions from "../../actions";
import { PageHeader, ScheduleView } from "../../components";
import { messages, constant } from "../../../../../utils";

class Schedules extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            isMounted: false
        };
    }

    componentDidMount() {
        this.getSchedules();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location !== prevProps.location) {
            this.getSchedules();
        }
    }

    getSchedules = () => {
        const { location: {search}, getSchedules } = this.props;
        const jobId = (new URLSearchParams(search)).get("jobId");
        const viewMode = (new URLSearchParams(search)).get("viewMode");
        const startDate = (new URLSearchParams(search)).get("startDate");
        
        const params = {
            start_date: startDate? moment(startDate.slice(0, 10)).format('YYYY-MM-DDTHH:mm:ssZ') : moment().format('YYYY-MM-DDTHH:mm:ssZ')
        };
        
        if (viewMode === 'day') {
            params.end_date = moment(params.start_date).add(1, 'days').set({hour: 23, minute: 59, second: 59}).format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode === 'week') {
            params.end_date = moment(params.start_date).add(6, 'days').set({hour: 23, minute: 59, second: 59}).format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode === '2-weeks') {
            params.end_date = moment(params.start_date).add(13, 'days').set({hour: 23, minute: 59, second: 59}).format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode === '4-weeks') {
            params.end_date = moment(params.start_date).add(27, 'days').set({hour: 23, minute: 59, second: 59}).format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode === 'month') {
            params.end_date = moment(params.start_date).endOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
        } else if (viewMode === 'year') {
            params.end_date = moment(params.start_date).endOf('year').format('YYYY-MM-DDTHH:mm:ssZ');
        }

        if(jobId)
            params.job_id = jobId;

        getSchedules(params).then(({result: {data}}) => {
            this.setState({
                isMounted: true,
            })
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    };

    render() {
        const { isMounted } = this.state;
        const { history } = this.props;

        let content = (
            <div className="loader">
                <div className="cube-folding">
                    <span className="leaf1"/>
                    <span className="leaf2"/>
                    <span className="leaf3"/>
                    <span className="leaf4"/>
                </div>
                <span className="loader-text">Loading ...</span>
            </div>
        );
        if (isMounted) {
            content = (
                <div className="container-fluid">
                    <ScheduleView history={history}/>
                </div>
            )
        }

        return (
            <React.Fragment>
                <PageHeader type="schedule" history={history}/>

                <div className="page-content">
                    {content}
                </div>
            </React.Fragment>
        );
    }
}

Schedules.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
    getSchedules: PropTypes.func.isRequired,
};

export default connect(
    selectors,
    { ...actions.schedules }
)(Schedules);
