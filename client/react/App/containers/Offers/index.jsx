import React, { Component } from "react";
import PropTypes from "prop-types";
import {toast} from "react-toastify";
import connect from 'react-redux/es/connect/connect';

import {PageHeader, OfferCard, Loader, Slider, OfferDetail} from "../../components";
import { messages, paths } from "../../../../../utils";
import selectors from './selectors';
import actions from '../../actions';

class Offers extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            offers: [],
            offerSelected: null,
            archive: false,
            isOfferDetail: false
        };
        this.limit = 10;
        this.lastValue = null;
        this.orderBy = "id";
        this.hasScrollListener = false;
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const archive = urlParams.get('archive') === 'true';
        if((archive === true)) {
            this.setState({archive: true});
        }
        this.getSelectedOfferId();
        this.loadOffers(archive);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location !== prevProps.location) {
            this.getSelectedOfferId();
        }
    }

    componentWillUnmount() {
        if (this.hasScrollListener) {
            window.removeEventListener("scroll", this.loadMore);
            this.hasScrollListener = false;
        }
    }

    getSelectedOfferId = () => {
        const { location: { search } } = this.props;
        const offerId = (new URLSearchParams(search)).get("offerId");
        const notification = (new URLSearchParams(search)).get("notification");
        if(notification === 'offerDetail'){
            this.setState({isOfferDetail: true});
        }
        this.setState({offerSelected: offerId});
    }

    loadOffers = (archive) => {
        const { getOffers, getArchivedOffers } = this.props;
        let params = {
            limit: this.limit,
            orderBy: this.orderBy,
        };
        if (this.lastValue)
            params.lastValue = this.lastValue;
        if((archive === true)) {
            getArchivedOffers(params).then(({ result: { data } }) => {
                let { offers } = this.state;
    
                offers = offers.concat(data.offers);
                this.lastValue = data.lastValue;
                this.setState({ offers }, () => {
                    if (data.offers.length > 0 && data.offers.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }else {
            getOffers(params).then(({ result: { data } }) => {
                let { offers } = this.state;
    
                offers = offers.concat(data.offers);
                this.lastValue = data.lastValue;
                this.setState({ offers }, () => {
                    if (data.offers.length > 0 && data.offers.length >= this.limit) {
                        if (!this.hasScrollListener) {
                            window.addEventListener('scroll', this.loadMore);
                            this.hasScrollListener = true;
                        }
                    } else if (this.hasScrollListener) {
                        window.removeEventListener("scroll", this.loadMore);
                        this.hasScrollListener = false;
                    }
                });
            }).catch(() => {
                toast.error(messages.INTERNAL_SERVER_ERROR);
            });
        }
    };

    loadMore = () => {
        const { isLoading } = this.props;
        const { archive } = this.state;

        if (!isLoading && window.scrollY + window.innerHeight >= document.body.clientHeight) {
            this.loadOffers(archive);
        }
    };

    selectOffer = (id) => {
        const { history: { push } } = this.props;
        if(id)
            push(`${paths.client.APP_OFFERS}?offerId=${id}`);
        else 
            push(paths.client.APP_OFFERS);

        let { offers } = this.state;
        const index = offers.findIndex(el=>el.id == id);
        if(index > -1) {
            offers[index].read_offer = true
        }
        this.setState({
            offers,
            offerSelected: id
        });
    };

    render() {
        const { isLoading, history } = this.props;
        const { offers, offerSelected, archive, isOfferDetail } = this.state;
        let content;

        if (!isLoading && offers.length === 0) {
            content = (
                <h3 className="text-center">
                    {messages.NO_DATA}
                </h3>
            )
        } else {
            content = (
                <div className="row">
                    {offers.map((item, index) => {
                        return (
                            <div className="col-12 mb-3">
                                <OfferCard
                                    key={index}
                                    data={item}
                                    onClick={() => this.selectOffer(item.id)}
                                    selected={item.id === offerSelected}
                                />
                            </div>
                        );
                    })}
                    {isLoading && (
                        <div className="col-12 mt-5">
                            <Loader />
                        </div>
                    )}
                </div>
            );
        }

        if(!isOfferDetail) {
            return (
                <React.Fragment>
                    <PageHeader type={archive === true?"archive":"offers"} />
    
                    <div className="page-content">
                        <div className="container">
                            {content}
                        </div>
                    </div>
                    {offerSelected && (
                        <Slider
                            onUnmount={() => this.selectOffer(null)}
                        >
                            <OfferDetail
                                id={offerSelected} history={history}
                            />
                        </Slider>
                    )}
                </React.Fragment>
            );
        }else {
            return (
                <div className="card detail-card">
                    <div className="card-body">
                        <OfferDetail
                            id={offerSelected} history={history}
                        />
                    </div>
                </div>
            )
        }

    }
}

Offers.propTypes = {
    getOffers: PropTypes.func.isRequired,
    getArchivedOffers: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired
};

export default connect(
    selectors,
    { 
        ...actions.offers,
        ...actions.settings
    }
)(Offers);
