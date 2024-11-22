import React, { Component } from 'react';
import { TableView, TableActions } from '../../../components';
import { Badge } from 'reactstrap';
import selectors from './selectors';
import actions from '../../../actions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import { withRouter } from 'react-router-dom';
import { paths } from '../../../../../../utils';
import moment from 'moment';

class Payments extends Component {
    constructor() {
        super();
        this.state = {
          columns: [
            'User Name',
            'Email',
            'Job Title',
            'Refunded',
            'Status',
            'Paid Date',
            'Actions'
          ],
          payments: [],
          total: 1,
          offset: 1,
          defaultLimit: 10,
          filter: '',
          loading: false,
        }

        this.onPagination = this.onPagination.bind(this);
        this.handleAction = this.handleAction.bind(this);
    }

    componentDidMount() {
      const { getPaymentsHistory } = this.props;
      const { defaultLimit, offset } = this.state;

      this.setState({
        loading: true
      });

      getPaymentsHistory({limit: defaultLimit, offset})
      .then(({result: {data}}) => {
        this.setState({
          payments: data.customer_charges,
          total: data.total,
          loading: false
        })
      }).catch(() => {
        toast.error("Failed To get payment history", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
        this.setState({
          loading: false
        })
      });
    }

    handleAction(payment) {
      const { refundPayments } = this.props;
      let {payments} = this.state;
      refundPayments(payment.charge_id)
      .then(({result: {data}}) => {
        toast.success(data.msg);
        const id = payments.findIndex(el=>el.id == payment.id);
        if(id > 0) {
          payments[id].status = true;
          this.setState({payments});
        }
      }).catch(({response: {data}}) => {
        toast.error(data.msg);
      })
    }

    onPagination({ offset, limit }) {
      const { getPaymentsHistory } = this.props;
      this.setState({
        offset: offset,
        loading: true
      });

      getPaymentsHistory({offset, limit})
      .then(({result: {data}}) => {
        this.setState({
          payments: data.customer_charges,
          total: data.total,
          loading: false
        });
      }).catch(() => {
        toast.error("Failed To get payment history", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
        this.setState({
          loading: false
        })
      });
    }

    renderPaymentsTable () {
        const { columns, payments, offset,  loading, defaultLimit, total } = this.state;

        const tableBody = payments.map((payment, key) => (
            <tr key={key}>
                <td>{payment.user.first_name + ", " + payment.user.last_name}</td>
                <td>{payment.user.email}</td>
                <td>{payment.job?payment.job.title:""}</td>
                <td>{payment.charge_type}</td>
                <td>{payment.status==true?<Badge color="danger">{"Refunded"}</Badge>:(payment.status==="succeeded"?<Badge color="success">{"Paid"}</Badge>:null)}</td>
                <td>{moment(payment.createdAt).format("MM/DD/YYYY")}</td>
                <td>
                  {!(payment.status)?<button type="button" aria-haspopup="true" aria-expanded="false" class="refund-action-button btn btn-secondary" onClick={() => this.handleAction(payment)}>Refund</button>:null}
                </td>
            </tr>
        ));

        return (
            <TableView columns={columns} tableBody={tableBody}
              tableHeader={"payments"}
              selectEnable={false}
              isPagination={false}
              limitEnable={false}
              limit={defaultLimit}
              page={offset}
              onPagination={this.onPagination}
              loading={loading}
              page={offset}
              isPagination={true}
              total={total}/>
        )
    }
  render() {
    return (
      <div className="animated fadeIn">
        {this.renderPaymentsTable()}
      </div>

    );
  }
}

Payments.propTypes = {
  getPaymentsHistory: PropTypes.func.isRequired,
  refundPayments: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};


export default connect(
  selectors,
  { 
    ...actions.payments,
  },
)(withRouter(Payments));