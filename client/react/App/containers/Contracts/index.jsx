import React, { Component } from "react";
import { connect } from 'react-redux';
import { toast } from "react-toastify";
import { isEmpty, uniqBy } from 'lodash';
import PropTypes from "prop-types";
import selectors from './selectors';
import actions from '../../actions';

import { PageHeader, Loader, ContractCard, Slider, ContractDetail } from "../../components";
import { messages, constant, paths } from "../../../../../utils";

class Contracts extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            contracts: [],
            contractSelected: null,
            isHirerView: false,
            archive: false,
            jobId: null,
            isContractDetail: false,
            authUser: JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT))
        };
        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('jobId');
        const archive = urlParams.get('archive') === 'true';
        const contractId = urlParams.get("contractId");
        if(jobId) {
            this.setState({jobId});
        }
        if(archive === true) {
            this.setState({archive: true});
        }
        this.loadContracts(jobId, archive, contractId);
        this.getSelectedContractId();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location !== prevProps.location) {
            this.getSelectedContractId();
        }
    }

    componentWillUnmount() {
        if (this.hasScrollListener) {
            window.removeEventListener("scroll", this.loadMore);
            this.hasScrollListener = false;
        }
    }

    loadContracts = (jobId, archive, contractId) => {
        const { getContracts, getArchieveContract } = this.props;
        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
        };
        if(jobId)
            params.job_id = jobId;
        if (this.lastValue)
            params.lastValue = this.lastValue;

        if(archive) {
            getArchieveContract(params).then(({ result: { data } }) => {
                let { contracts } = this.state;
    
                contracts = contracts.concat(data.contracts);
                this.lastValue = data.lastValue;
                this.setState({ contracts }, () => {
                    if (data.contracts.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
    
                    if(contractId)
                        this.selectContract(contractId)
                    else if(jobId && contracts.length > 0) {
                        this.selectContract(contracts[0].id)
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }else {
            getContracts(params).then(({ result: { data } }) => {
                let { contracts } = this.state;
                contracts = uniqBy((contracts.concat(data.contracts)),'job_id');
                this.lastValue = data.lastValue;
                this.setState({ contracts }, () => {
                    if (data.contracts.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
    
                    if(contractId)
                        this.selectContract(contractId)
                    else if(jobId && contracts.length > 0) {
                        this.selectContract(contracts[0].id)
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }
    };

    loadMore = () => {
        const { isLoading } = this.props;
        const { archive, jobId, contractSelected } = this.state;
        if (!isLoading && window.scrollY + window.innerHeight >= document.body.clientHeight) {
            this.loadContracts(jobId, archive, contractSelected);
        }
    };

    getSelectedContractId = () => {
        const { location: { search } } = this.props;
        let { contracts } = this.state;
        const contractId = (new URLSearchParams(search)).get("contractId");
        const notification = (new URLSearchParams(search)).get("notification");
        if(notification === 'contractDetail'){
            this.setState({isContractDetail: true});
        }

        const index = contracts.findIndex(el=>el.id == contractId);
        if(index > -1) {
            contracts[index].read_jobber = true;
        }
        this.setState({
            contractSelected: contractId,
            contracts
        });
    }

    selectContract = (id) => {
        const { history: { push } } = this.props;
        const { authUser } = this.state;
        if(id){
            const urlParams = new URLSearchParams(window.location.search);
            const jobId = urlParams.get('jobId');
            let urlRedirect = `${paths.client.APP_CONTRACTS}?contractId=${id}`;
            if(jobId)
                urlRedirect += `&jobId=${jobId}`;
            push(urlRedirect);
        }else
            push(paths.client.APP_CONTRACTS);

        let { contracts } = this.state;
        const index = contracts.findIndex(el=>el.id == id);
        if(index > -1) {
            const isHirer = contracts[index].hirer.id === authUser.id;
            if(isHirer) {
                contracts[index].read_hirer = true
            }
            if(!isHirer) {
                contracts[index].read_jobber = true
            }
        }
        this.setState({
            contracts,
            contractSelected: id
        });
    };

    render() {
        const { isLoading, history } = this.props;
        const { contracts, contractSelected, archive, isContractDetail, authUser } = this.state;
        let jobId = null;
        let isHirerView = false;
        if(contractSelected) {
            const contract = contracts.find(el=>el.id == contractSelected);
            if(contract){
                jobId = contract.job_id;
                isHirerView = contract.hirer_id === authUser.id?true:false
            }
        }
        let content;

        if (!isLoading && contracts.length === 0) {
            content = (
                <h3 className="text-center">
                    {messages.NO_DATA}
                </h3>
            )
        } else {
            content = (
                <div className="row">
                    {contracts.map((item, index) => {
                        return (
                            <div className="col-12 mb-3">
                                <ContractCard
                                    user={authUser}
                                    key={index}
                                    data={item}
                                    onClick={() => this.selectContract(item.id)}
                                    selected={item.id === (isEmpty(contractSelected)?null:contractSelected)}
                                />
                            </div>
                        );
                    })}
                    {isLoading ?
                        <div className="col-12 mt-5">
                            <Loader />
                        </div> : null
                    }
                </div>
            );
        }

        if(!isContractDetail) {
            return (
                <React.Fragment>
                    <PageHeader type={archive === true?"archive":"contracts"} />
    
                    <div className="page-content">
                        <div className="container">
                            {content}
                        </div>
                    </div>
                    {contractSelected&& (
                        <Slider
                            onUnmount={() => this.selectContract(null)}
                        >
                            <ContractDetail
                                id={contractSelected}
                                isHirerView={isHirerView}
                                history={history}
                            />
                        </Slider>
                    )}
                </React.Fragment>
            );
        }else {
            return (
                <div className="card detail-card">
                    <div className="card-body">
                        <ContractDetail
                            id={contractSelected}
                            isHirerView={isHirerView}
                            history={history}
                        />
                    </div>
                </div>
            )
        }
    }
}

Contracts.propTypes = {
    getContracts: PropTypes.func.isRequired,
    getArchieveContract: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
    }).isRequired
};

export default connect(
    selectors,
    { 
        ...actions.contracts,
        ...actions.settings
    }
)(Contracts);
