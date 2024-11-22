import React, { Component } from "react";
import PropTypes from "prop-types";
import {toast} from "react-toastify";
import connect from 'react-redux/es/connect/connect';

import {PageHeader, Loader, Slider, ReportDetail} from "../../components";
import { reports } from "../../../../../utils";
import selectors from './selectors';
import actions from '../../actions';

class Reports extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            selReports: [],
            showReport: false,
            reportsInfos: []
        };
    }

    handleSelectReport = (type, item) => {
        let { selReports } = this.state;
        const reportIndex = selReports.findIndex((el) => {
            if(el.type === type  && el.id === item.id) {
                return true;
            }
            return false;
        });

        if(reportIndex > -1) 
            selReports.splice(reportIndex, 1);
        else 
            selReports.push({type, id: item.id});

        this.setState({selReports});
    }

    handleRunReport = (job, jobber, start_date, end_date, view_mode) => {
        const { runReport } = this.props;
        const {selReports} = this.state;
        this.setState({
            showReport: true
        });
        runReport({sel_reports: selReports, job, jobber, start_date, end_date, view_mode})
        .then(({result: {data}}) => {
            this.setState({
                reportsInfos: data.reports
            });
        }).catch(() => {
            toast.error(messages.INTERNAL_SERVER_ERROR);
        });
    }

    render() {
        const {selReports, showReport, reportsInfos} = this.state;
        return (
            <React.Fragment>
                <PageHeader type="reports" onReport={this.handleRunReport}/>

                <div className="page-content">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <h3>Job specific</h3>
                                {
                                    reports.jobSpecifics.map((item, key) => {
                                        const isSelected = selReports.find((el)=> {
                                            if(el.type === "specific" && el.id === item.id)  return true;
                                            return false
                                        });
                                        return (
                                            <div className={"card report-card mt-3" + (isSelected?" selected":"")} key={key} onClick={() => this.handleSelectReport('specific', item)}>
                                                <div className="card-body">{item.content}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className="col-lg-6 col-md-12">
                                <h3>All jobs combined</h3>
                                {
                                    reports.allJobsCombined.map((item, key) => {
                                        const isSelected = selReports.find((el)=> {
                                            if(el.type === "all" && el.id === item.id)  return true;
                                            return false
                                        });
                                        return (
                                            <div className={"card report-card mt-3" + (isSelected?" selected":"")} key={key} onClick={() => this.handleSelectReport('all', item)}>
                                                <div className="card-body">{item.content}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {showReport && (
                    <Slider
                        onUnmount={() => this.setState({
                            showReport: false
                        }) }
                    >
                        <ReportDetail
                            reportsInfos={reportsInfos} history={history}
                        />
                    </Slider>
                )}
            </React.Fragment>
        );
    }
}

Reports.propTypes = {
    runReport: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired
};

export default connect(
    selectors,
    { 
        ...actions.reports,
        ...actions.settings
    }
)(Reports);
