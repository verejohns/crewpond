import React, { Component } from "react";
import { Link, withRouter } from 'react-router-dom';
import PropTypes from "prop-types";

import items from "./items";

class PageSideMenu extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { type, location: { pathname, hash } } = this.props;

        return (
            <React.Fragment>
                <div className="card">
                    <div className="card-body">
                        <ul className="sub-menu-list">
                            {items[type][0].map((item, index) => {
                                return (
                                    <li key={index}>
                                        <Link to={item.url} className={pathname + hash === item.url ? 'active' : ''}>{item.title}</Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>

                {items[type].length > 1 ?
                    <div className="card mt-5">
                        <div className="card-body">
                            <ul className="sub-menu-list">
                                {items[type][1].map((item, index) => {
                                    return (
                                        <li key={index}>
                                            <Link to={item.url} className={pathname + hash === item.url ? 'active' : ''}>{item.title}</Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div> : null
                }
            </React.Fragment>
        );
    }
}

PageSideMenu.propTypes = {
    type: PropTypes.string.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired
    }).isRequired
};

export default (withRouter(PageSideMenu));
