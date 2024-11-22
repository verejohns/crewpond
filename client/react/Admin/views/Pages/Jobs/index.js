import React, { Component } from 'react';
import { TableView, TableActions } from '../../../components';
import selectors from './selectors';
import actions from '../../../actions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { withRouter } from 'react-router-dom';
import { Badge } from 'reactstrap';
import { paths } from '../../../../../../utils';

class Jobs extends Component {
    constructor() {
      super();
      this.state = {
        columns: [
          'select',
          'Title',
          'Description',
          'Price',
          'Category',
          'Status',
          'Actions'
        ],
        jobs: [],
        total: 1,
        offset: 1,
        defaultLimit: 10,
        keyword: '',
        actions: [{id: 'action-delete', label: "Delete"},
                  {id: 'action-edit', label: "Edit"},
                  {id: 'action-hide', label: "Hide"},
                  {id: 'action-show', label: "Show"},
                  {id: 'action-cancel', label: "Cancel"},
                  {id: 'action-resume', label: "Resume"},
                  {id: 'action-complete', label: "Complete"},
                  {id: 'action-uncomplete', label: "Uncomplete"}]
      };

      this.handleRecordSearch = this.handleRecordSearch.bind(this);
      this.onPagination = this.onPagination.bind(this);
      this.handleAction = this.handleAction.bind(this);
      this.hideJob = this.hideJob.bind(this);
      this.cancelJob = this.cancelJob.bind(this);
      this.deleteJob = this.deleteJob.bind(this);
      this.completeJob = this.completeJob.bind(this);
      this.uncompleteJob = this.uncompleteJob.bind(this);
    }

    componentDidMount() {
      const { getJobs } = this.props;
      const { defaultLimit, offset } = this.state;

      getJobs({offset: offset, orderBy: 'createdAt', limit: defaultLimit})
      .then(({result: {data}}) => {
        this.setState({
          jobs:data.jobs,
          total: data.total,
        });
      });
    }

    hideJob(id, hide) {
      const { updateJob } = this.props;
      updateJob(id, 
        {
          is_hided: hide
        }
      ).then(({result: {data}}) => {
        let index = this.state.jobs.findIndex(el=>el.id==id);
        let jobs = [...this.state.jobs];
        jobs[index].is_hided = hide;

        this.setState({
          jobs: jobs
        });
        toast.success(data.msg, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      }).catch(({response}) => {
        if(!response) return;
        toast.error(response.data.msg, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      })
    }

    deleteJob(id) {
      const { deleteJob } = this.props;

      deleteJob(id)
      .then(({result: {data}}) => {
        this.setState(prevState => ({
          jobs: prevState.jobs.filter(el=>el.id != id)
        }));
        toast.success(data.msg, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      }).catch(({response: {data}}) => {
        toast.error(data.msg, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      });
    }

    completeJob(id) {
      const { completeJob } = this.props;

      completeJob(id)
      .then(({result: {data}}) => {
        let index = this.state.jobs.findIndex(el=>el.id==id);
        let jobs = [...this.state.jobs];
        jobs[index].is_completed = true;

        this.setState({
          jobs: jobs
        });
        toast.success('Completed job successfully.', {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      }).catch(({response: {data}}) => {
        toast.error('Failed to complete job.', {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      });
    }

    uncompleteJob(id) {
      const { uncompleteJob } = this.props;

      uncompleteJob(id)
      .then(({result: {data}}) => {
        let index = this.state.jobs.findIndex(el => el.id === id);
        let jobs = [...this.state.jobs];
        jobs[index].is_completed = false;

        this.setState({
          jobs: jobs
        });

        toast.success('Uncompleted job successfully.', {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      }).catch(({response: {data}}) => {
        toast.error('Failed to uncomplete job.', {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      });
    }

    cancelJob(id, cancel) {
      const { updateJob } = this.props;
      updateJob(id, 
        {
          is_cancelled: cancel
        }
      ).then(({result: {data}}) => {
        let index = this.state.jobs.findIndex(el=>el.id==id);
        let jobs = [...this.state.jobs];
        jobs[index].is_cancelled = cancel;

        this.setState({
          jobs: jobs
        });
        toast.success(data.msg, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      }).catch(({response}) => {
        toast.error(response.data.msg, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
      })
    }

    handleAction(id, job) {
      const job_id = job.id
      if(id === 'action-edit'){
        const { history: {push}} = this.props;
        push(paths.build(paths.client.ADMIN_EDIT_JOB, job_id));
      }
      if(id === 'action-delete') {
        this.deleteJob(job_id);
      }

      if(id === 'action-hide') {
        this.hideJob(job_id, true);
      }

      if(id === 'action-cancel') {
        this.cancelJob(job_id, true);
      }

      if(id === 'action-resume') {
        this.cancelJob(job_id, false);
      }

      if(id === 'action-show') {
        this.hideJob(job_id, false);
      }

      if(id === 'action-complete') {
        this.completeJob(job_id);
      }

      if(id === 'action-uncomplete') {
        this.uncompleteJob(job_id);
      }
    }

    onPagination({ offset, orderBy, limit, keyword, categories, location, range }) {
      const { getJobs } = this.props;
      this.setState({
        offset: offset,
        searchStr: keyword,
      });

      getJobs({offset: offset, orderBy, limit, keyword, categories, location, range})
      .then(({result: {data}}) => {
        this.setState({
          jobs:data.jobs,
          total: data.total,
        });
      });
    }

    handleRecordSearch({ orderBy, limit, keyword, categories, location, range }) {
      const { getJobs } = this.props;
      this.setState({
        offset: 1,
        searchStr: keyword,
      });

      getJobs({offset: 1, orderBy, limit, keyword, categories, location, range})
      .then(({result: {data}}) => {
        this.setState({
          jobs:data.jobs,
          total: data.total,
        })
      });
    }


    renderJobsTable () {
        const { columns, jobs, offset, total, actions, defaultLimit } = this.state;
        const { isSubmitting } = this.state;

        const tableBody = jobs.map((job, key) => (
            <tr key={key}>
              <td><input type="checkbox"></input></td>
              <td><div className="job-title">{job.title}</div></td>
              <td>{job.description}</td>
              <td>{job.price}</td>
              <td><div key={key} className="job-category">{job.category?(job.category.main + " : " + job.category.sub):""}</div></td>
              <td>
                {job.is_cancelled?<Badge color="warning">{"Cancelled"}</Badge>:null}
                {job.is_closed?<Badge color="dark">{"Closed"}</Badge>:null}
                {job.is_completed?<Badge color="success">{"Completed"}</Badge>:null}
                {job.is_assigned?<Badge color="info">{"Assigned"}</Badge>:null}
                {job.is_hided?<Badge color="warning">{"Hided"}</Badge>:null}
                {(!job.is_cancelled && !job.is_closed && !job.is_completed && !job.is_assigned && !job.is_hided)?<Badge color="primary">{"Available"}</Badge>:null}</td>
              <td><TableActions item={job} type={'job'} actions={actions} handleAction={this.handleAction}/></td>
            </tr>
          )
        );

        return (
            <TableView columns={columns} tableBody={tableBody}
                tableHeader={"jobs"}
                selectEnable={false}
                placeholder={"Search Job"}
                limitEnable={false}
                limit={defaultLimit}
                handleRecordSearch={this.handleRecordSearch}
                onPagination={this.onPagination}
                loading={isSubmitting}
                page={offset}
                isPagination={true}
                total={total}/>
        )
    }
  render() {
    return (
      <div className="animated fadeIn">
        {this.renderJobsTable()}
      </div>

    );
  }
}

Jobs.propTypes = {
  isJobsLoaded: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  getJobs: PropTypes.func.isRequired,
  deleteJob: PropTypes.func.isRequired,
  completeJob: PropTypes.func.isRequired,
  uncompleteJob: PropTypes.func.isRequired,
  updateJob: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};


export default connect(
  selectors,
  { 
    ...actions.jobs,
  },
)(withRouter(Jobs));