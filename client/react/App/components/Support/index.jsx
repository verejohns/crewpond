import React, { Component } from "react";
import PropTypes from "prop-types";
import { paths } from '../../../../../utils';
import { Modal, ModalBody, Nav} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { NavLink as RsNavLink } from 'reactstrap';

class Support extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const { handleClose, isOpen } = this.props;

        return (
            <Modal isOpen={isOpen} className="support-dialog" aria-labelledby="contained-modal-title-vcenter" centered>
                <div className="modal-dialog-header">
                    <img className="close-action" src="/static/images/icons/icon-exit.svg" alt="" onClick={handleClose}/>
                </div>

                <ModalBody>
                    <h5 className="modal-title text-center">Support</h5>
                    <div className="row support-title">
                        <div className="col-12">Email</div>
                    </div>
                    <div className="row support-content mt-2">
                        <div className="col-12"><a href="mailto:support@crewpond.com">support@crewpond.com</a></div>
                    </div>
                    <div className="row support-title mt-3">
                        <div className="col-12">Support</div>
                    </div>
                    <div className="row support-content mt-2">
                        <div className="col-12 d-flex flex-row align-items-center"><div className="description">Crew Pond Support Group</div>
                            <RsNavLink href="https://m.facebook.com/groups/326198294734521/#_=_">
                                <img src="/static/images/icons/icon-arrow-right.svg"></img>
                            </RsNavLink>
                        </div>
                    </div>
                    <div className="row support-content mt-2">
                        <div className="col-12 d-flex flex-row align-items-center"><div className="description">FAQ</div><NavLink to={paths.client.APP_USER_FAQ}><img src="/static/images/icons/icon-arrow-right.svg"></img></NavLink></div>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}

Support.defaultProps = {
    isOpen: false,
};

Support.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired
};

export default Support;
