import React, { Component } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import selectors from './selectors';
import actions from '../../../actions';
import { withRouter } from 'react-router-dom';
import { Score } from '../../../../components';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  CardTitle,
  Progress,
  Table,
} from 'reactstrap';
import moment from 'moment';

const mainChartOpts = {
  tooltips: {
    enabled: false,
    intersect: true,
    mode: 'index',
    position: 'nearest',
    callbacks: {
      labelColor: function(tooltipItem, chart) {
        return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
      }
    }
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          drawOnChartArea: false,
        },
      }],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          stepSize: Math.ceil(100 / 5),
          max: 100,
        },
      }],
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
};

const cardChartOpts = {
  tooltips: {
    enabled: false,
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent',
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },

      }],
    yAxes: [
      {
        display: false,
      }],
  },
  elements: {
    line: {
      tension: 0.00001,
      borderWidth: 1,
    },
    point: {
      radius: 4,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
};

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      user_number: 0,
      users_graph: null,
      job_number: 0,
      jobs_graph: null,
      available_users: 0,
      suspended_users: 0,
      closed_users: 0,
      opened_jobs: 0,
      assigned_jobs: 0,
      closed_jobs: 0,
      cancelled_jobs: 0,
      completed_jobs: 0,
      top_rated_users: [],
      jobs_info: null,
      users_info: null,
      card_graph: null,
      contract_data: null,
      contract_graph: null
    };
  }

  componentDidMount() {
    const { getCardGraph, getUsersInfo, getJobsInfo, getPaymentGraph, getTopRatedUsers, getContractGraph } = this.props;

    getCardGraph('month');
    getPaymentGraph('month');
    getUsersInfo();
    getJobsInfo();
    getTopRatedUsers(10);
    getContractGraph('month');
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  onRadioBtnClick(radioSelected) {
    const { getContractGraph } = this.props;
    switch(radioSelected) {
      case 3: 
        getContractGraph('year');
        break;
      case 2:
        getContractGraph('month');
        break;
      case 1:
        getContractGraph('date');
        break;
      default:
        break;
    }

    this.setState({
      radioSelected: radioSelected,
    });
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.isLoadedCardGraph && (JSON.stringify(this.state.card_graph) !== JSON.stringify(nextProps.card_graph))){
      if(nextProps.card_graph.result === 'success') {
        const card_graph = nextProps.card_graph.data;
        const jobs_graph = this.generateChartDataMonthly(card_graph.jobs_graph, "Available Jobs", 'rgba(255,255,255,.55)');
        const users_graph = this.generateChartDataMonthly(card_graph.users_graph, "Available Users", 'rgba(255,255,255,.55)');
        
        this.setState({
          card_graph: nextProps.card_graph,
          user_number: card_graph.user_number,
          job_number: card_graph.job_number,
          jobs_graph: jobs_graph,
          users_graph: users_graph
        })
      }
    }

    if(nextProps.isLoadedUsersInfo && (JSON.stringify(this.state.users_info) !== JSON.stringify(nextProps.users_info))){
      if(nextProps.users_info.result === 'success') {
        const { available_users, suspended_users, closed_users } = nextProps.users_info.data;
        this.setState({
          users_info: nextProps.users_info,
          available_users: available_users,
          suspended_users: suspended_users,
          closed_users: closed_users,
        })
      }
    }

    if(nextProps.isLoadedJobsInfo && (JSON.stringify(this.state.jobs_info) !== JSON.stringify(nextProps.jobs_info))){
      if(nextProps.jobs_info.result === 'success') {
        this.setState({
          jobs_info: nextProps.jobs_info,
          opened_jobs: nextProps.jobs_info.data.opened_jobs,
          assigned_jobs: nextProps.jobs_info.data.assigned_jobs,
          cancelled_jobs: nextProps.jobs_info.data.cancelled_jobs, 
          closed_jobs: nextProps.jobs_info.data.closed_jobs, 
          completed_jobs: nextProps.jobs_info.data.completed_jobs
        })
      }
    }

    if(nextProps.isLoadedTopRatedUsers && (JSON.stringify(this.state.top_rated_users) !== JSON.stringify(nextProps.top_rated_users))){
      if(nextProps.top_rated_users.result === 'success') {
        this.setState({
          top_rated_users: nextProps.top_rated_users.data
        })
      }
    }

    if(nextProps.isLoadedContractGraph && (JSON.stringify(this.state.contract_data) !== JSON.stringify(nextProps.contract_graph))) {
      if(nextProps.contract_graph.result === 'success') {
        const data = nextProps.contract_graph.data;
        let contract_graph = null;
        if(this.state.radioSelected === 1)
          contract_graph = this.generateChartDataDaily(data, "Contracts", 'rgba(200,200,255)', 2);
        else if(this.state.radioSelected === 2)
          contract_graph = this.generateChartDataMonthly(data, "Contracts", 'rgba(200,200,255)', 2);
        else if(this.state.radioSelected === 3)
          contract_graph = this.generateChartDataYearly(data, "Contracts", 'rgba(200,200,255)', 2);
        
        this.setState({
          contract_data: nextProps.contract_graph,
          contract_graph: contract_graph
        })
      }
    }
  }

  generateChartDataYearly(array, label, borderColor, borderWidth, pointColor) {
    let yearArray = [];
    const currentDate = new Date()
    for (let i= 4; i >= 0 ; i -= 1){
      const year = currentDate.getFullYear() - i
      yearArray.push(year);
    }

    return(
      {
        labels: yearArray,
        datasets: [
          {
            label: label,
            borderColor: borderColor,
            data: array,
            borderWidth: borderWidth,
            pointHoverBackgroundColor: pointColor
          },
        ]
      }
    );
  }

  generateChartDataMonthly(array, label, borderColor, borderWidth, pointColor) {
    const monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date()
    let monthLabel = [];
    for(let id = 0; id < monthArray.length; id += 1){
      const monthId = (id + currentDate.getMonth() + 1)%12;
      monthLabel.push(monthArray[monthId]);
    }
    
    return(
      {
        labels: monthLabel,
        datasets: [
          {
            label: label,
            borderColor: borderColor,
            data: array,
            borderWidth: borderWidth,
            pointHoverBackgroundColor: pointColor
          },
        ]
      }
    );
  }

  generateChartDataDaily(array, label, borderColor, borderWidth, pointColor) {
    const dateArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
    const currentDate = new Date()
    let dateLabel = [];
    for(let id = 0; id < dateArray.length; id += 1){
      const dateId = (id + currentDate.getDate() + 1)%31;
      dateLabel.push(dateArray[dateId]);
    }
    
    return(
      {
        labels: dateLabel,
        datasets: [
          {
            label: label,
            borderColor: borderColor,
            data: array,
            borderWidth: borderWidth,
            pointHoverBackgroundColor: pointColor
          },
        ]
      }
    );
  }

  generateChartDataHourly(array, label, borderColor, borderWidth, pointColor) {
    const hourArray = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    const currentDate = new Date()
    let hourLabel = [];
    for(let id = 0; id < hourArray.length; id += 1){
      const hourId = (id + currentDate.getHours() + 1)%24;
      hourLabel.push(hourArray[hourId]);
    }
    
    return(
      {
        labels: hourLabel,
        datasets: [
          {
            label: label,
            borderColor: borderColor,
            data: array,
            borderWidth: borderWidth,
            pointHoverBackgroundColor: pointColor
          },
        ]
      }
    );
  }

  renderCardGraph () {
    const { user_number, job_number, users_graph, jobs_graph } = this.state;

    return (
      <div className="row">
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card text-white bg-info">
            <div className="card-body pb-0">
              <div className="text-value">{user_number}</div>
              <div className="text-card-title">Customers</div>
            </div>
            <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
              {users_graph?<Line data={users_graph} options={cardChartOpts} height={70} />:null}
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card text-white bg-warning">
            <div className="card-body pb-0">
              <div className="text-value">{job_number}</div>
              <div className="text-card-title">Jobs</div>
            </div>
            <div className="chart-wrapper" style={{ height: '70px' }}>
              {jobs_graph?<Line data={jobs_graph} options={cardChartOpts} height={70} />:null}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card text-white bg-danger">
            <div className="card-body pb-0">
              <div className="text-value">9.823</div>
              <div className="text-card-title">Payments</div>
            </div>
            <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
              {jobs_graph?<Bar data={jobs_graph} options={cardChartOpts} height={70} />:null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderContractGraph() {
    const { available_users, suspended_users, closed_users, opened_jobs, assigned_jobs, cancelled_jobs, closed_jobs, completed_jobs, contract_graph } = this.state;
    const sum_users = available_users + suspended_users + closed_users;
    const sum_jobs = opened_jobs + assigned_jobs + cancelled_jobs + closed_jobs + completed_jobs;
    return (
      <div className="row">
        <div className="col-12 col-sm-8 col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-sm-5 col-12">
                  <CardTitle className="mb-0">Contracts</CardTitle>
                  <div className="small text-muted">{moment().format("MMM YYYY")}</div>
                </div>
                <div className="col-sm-7 col-12 d-none d-sm-inline-block">
                  <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                    <ButtonGroup className="mr-3" aria-label="First group">
                      <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)} active={this.state.radioSelected === 1}>Day</Button>
                      <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)} active={this.state.radioSelected === 2}>Month</Button>
                      <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(3)} active={this.state.radioSelected === 3}>Year</Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </div>
              </div>
              <div className="chart-wrapper" style={{ height: 300 + 'px', marginTop: 40 + 'px' }}>
                {contract_graph?<Line data={contract_graph} options={mainChartOpts} height={300} />:null}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-4 col-lg-4">
          <div className="card">
            <div className="card-body">
              <CardTitle className="mb-0">{'Users & Jobs'}</CardTitle>
              <div className="row user-job-info">
                <div className="col-12">
                  <div className="text-muted">{"Available Users"}</div>
                  <strong>{available_users} Users ({sum_users === 0?0:(available_users/sum_users)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="success" value={sum_users === 0?0:(available_users/sum_users)*100} />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="text-muted">{"Suspended Users"}</div>
                  <strong>{suspended_users} Users ({sum_users === 0?0:(suspended_users/sum_users)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="danger" value={sum_users === 0?0:(suspended_users/sum_users)*100} />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="text-muted">{"Closed Users"}</div>
                  <strong>{closed_users} Users ({sum_users === 0?0:(closed_users/sum_users)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="danger" value={sum_users === 0?0:(closed_users/sum_users)*100} />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="text-muted">{"Opened Jobs"}</div>
                  <strong>{opened_jobs} Jobs ({sum_jobs === 0?0:(opened_jobs/sum_jobs)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="success" value={sum_jobs === 0?0:(opened_jobs/sum_jobs)*100} />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="text-muted">{"Assigned Jobs"}</div>
                  <strong>{assigned_jobs} Jobs ({sum_jobs === 0?0:(assigned_jobs/sum_jobs)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="success" value={sum_jobs === 0?0:(assigned_jobs/sum_jobs)*100} />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="text-muted">{"Closed Jobs"}</div>
                  <strong>{closed_jobs} Jobs ({sum_jobs === 0?0:(closed_jobs/sum_jobs)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="danger" value={sum_jobs === 0?0:(closed_jobs/sum_jobs)*100} />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="text-muted">{"Cancelled Jobs"}</div>
                  <strong>{cancelled_jobs} Jobs ({sum_jobs === 0?0:(cancelled_jobs/sum_jobs)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="danger" value={sum_jobs === 0?0:(cancelled_jobs/sum_jobs)*100} />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="text-muted">{"Completed Jobs"}</div>
                  <strong>{completed_jobs} Jobs ({sum_jobs === 0?0:(completed_jobs/sum_jobs)*100}%)</strong>
                  <Progress className="progress-xs mt-2" color="info" value={sum_jobs === 0?0:(completed_jobs/sum_jobs)*100} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderTopRatedUsers() {
    const { top_rated_users } = this.state;
    
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <CardTitle className="mb-0">Top Rated Users</CardTitle>
              <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
                <thead className="thead-light">
                <tr>
                  <th className="text-center"><i className="fa fa-user"></i></th>
                  <th>User</th>
                  <th className="text-center">Country</th>
                  <th>Score</th>
                  <th>Activity</th>
                </tr>
                </thead>
                <tbody>
                  {
                    top_rated_users.map((user, key) => {
                      return (
                        <tr>
                          <td className="text-center">
                            <div className="avatar">
                              <img src={user.avatar} className="img-avatar"/>
                            </div>
                          </td>
                          <td>
                            <div>{user.first_name + " " + user.last_name}</div>
                          </td>
                          <td className="text-center">
                            <div>{user.address}</div>
                          </td>
                          <td>
                            <Score score={user.avg_score}></Score>
                          </td>
                          <td>
                            <div className="small text-muted">Last login</div>
                            <strong>{moment(user.last_login_time).format("YYYY-MM-DD HH:MM")}</strong>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {

    return (
      <React.Fragment>
        <div className="page-content">
          {this.renderCardGraph()}
          {this.renderContractGraph()}
          {this.renderTopRatedUsers()}
        </div>
      </React.Fragment>

    );
  }
}

Dashboard.propTypes = {
  getCardGraph: PropTypes.func.isRequired,
  getPaymentGraph: PropTypes.func.isRequired,
  getContractGraph: PropTypes.func.isRequired,
  getUsersInfo: PropTypes.func.isRequired,
  getTopRatedUsers: PropTypes.func.isRequired,
  getJobsInfo: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  isLoadedCardGraph: PropTypes.bool,
  isLoadedContractGraph: PropTypes.bool,
  isLoadedTopRatedUsers: PropTypes.bool,
  isLoadedUsersInfo: PropTypes.bool,
  isLoadedJobsInfo: PropTypes.bool,
  card_graph: PropTypes.object,
  contract_graph: PropTypes.object,
  top_rated_users: PropTypes.array,
  users_info: PropTypes.object,
  jobs_info: PropTypes.object,

  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};


export default connect(
  selectors,
  { 
    ...actions.dashboard,
  },
)(withRouter(Dashboard));