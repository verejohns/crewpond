import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import selectors from "./selectors";
import actions from "../../actions";
import { constant, reports } from "../../../../../utils";

import { CSVLink } from "react-csv";

class ReportDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            csvData: []
        }
        this.authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    }

    componentDidMount() {
        const {reportsInfos} = this.props;
        let csvData = [
            ["Type", "Description", "Total (eg Rates/hours/totals)"]
        ];
        for(let i = 0; i < reportsInfos.length; i += 1) {
            if(reportsInfos[i].type === 'specific') {
                const report = reports.jobSpecifics.find(el=>el.id === reportsInfos[i].id);
                csvData.push(["Job specific", report.content, reportsInfos[i].value]);
            }

            if(reportsInfos[i].type === 'all') {
                const report = reports.allJobsCombined.find(el=>el.id === reportsInfos[i].id);
                csvData.push(["All jobs combined", report.content, reportsInfos[i].value]);
            }
        }

        this.setState({csvData});
    }

    componentWillReceiveProps(nextProps) {
        if(JSON.stringify(nextProps.reportsInfos) !== JSON.stringify(this.props.reportsInfos)){
            let csvData = [
                ["Type", "Description", "Total (eg Rates/hours/totals)"]
            ];
            for(let i = 0; i < nextProps.reportsInfos.length; i += 1) {
                if(nextProps.reportsInfos[i].type === 'specific') {
                    const report = reports.jobSpecifics.find(el=>el.id === nextProps.reportsInfos[i].id);
                    csvData.push(["Job specific", report.content, nextProps.reportsInfos[i].value]);
                }
    
                if(nextProps.reportsInfos[i].type === 'all') {
                    const report = reports.allJobsCombined.find(el=>el.id === nextProps.reportsInfos[i].id);
                    csvData.push(["All jobs combined", report.content, nextProps.reportsInfos[i].value]);
                }
            }
    
            this.setState({csvData});
        }
    }

    render() {
        const {reportsInfos} = this.props;
        const {csvData} = this.state;

        let specifiJobs = [];
        specifiJobs.push(
            <tr className="mt-1">
                <th>Specific</th>
                <th></th>
            </tr>
        );
        let allJobs = [];
        allJobs.push(
            <tr className="mt-1">
                <th>All jobs combined</th>
                <th></th>
            </tr>
        );
        for(let i = 0; i < reportsInfos.length; i += 1){
            if(reportsInfos[i].type === 'specific') {
                const report = reports.jobSpecifics.find(el=>el.id === reportsInfos[i].id);
                specifiJobs.push(
                    <tr className="mt-1">
                        <td>{report.content}</td>
                        <td>{reportsInfos[i].value}</td>
                    </tr>
                );
            }

            if(reportsInfos[i].type === 'all') {
                const report = reports.allJobsCombined.find(el=>el.id === reportsInfos[i].id);
                allJobs.push(
                    <tr className="mt-1">
                        <td>{report.content}</td>
                        <td>{reportsInfos[i].value}</td>
                    </tr>
                );
            }
        }
        return (
            <div className="detail-container">
                <div className="slider-header status">
                    <div className="action">
                        <img className="print" src="/static/images/icons/icon-print.svg"></img>
                        <CSVLink filename={"job-report.csv"} data={csvData}><img className="download-csv" src="/static/images/icons/icon-download.svg"></img></CSVLink>
                        
                    </div>
                </div>

                <section>
                    <div className="flex-wrapper">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th width="60%">Description/Details</th>
                                    <th width="40%">Total (eg Rates/hours/totals)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {specifiJobs}
                                {allJobs}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        );
    }
}

ReportDetail.propTypes = {
    id: PropTypes.number.isRequired,
    reportsInfos: PropTypes.array.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default connect(
    selectors,
    { 
        ...actions.offers,
        ...actions.chats
    }
)(ReportDetail);
