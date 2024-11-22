import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';
import { paths } from '../../../../../utils';
import actions from '../../actions';
import connect from 'react-redux/es/connect/connect';
import { Link } from 'react-router-dom';


class DropDownMenu extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
    };
    this.handleDropDownMenu = this.handleDropDownMenu.bind(this);
  }

  componentDidMount() {
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  handleDropDownMenu (event) {
    const { history: { push }, logout } = this.props;
    switch(event.target.id){
      case "account_setting":
//        push(paths.client.ACCOUNT_SETTING);
        break;
    }
  }



  render() {
    return (
      <Dropdown className="profile-menu" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <div className="avatar-view dropdown-toggle" data-toggle="dropdown">
          <img className="avatar-circle" src={'/static/images/avatar-white.png'}></img>
        </div>
        <DropdownMenu>
          {/*<div onClick={this.handleDropDownMenu} id="account_setting" className="dropdown-menu-item"><i className="fa fa-cog"></i>Settings</div>*/}
          <a href={paths.client.ADMIN_LOGOUT} className="dropdown-menu-item">
            <i className="fa fa-sign-out"></i>Sign out
          </a>
        </DropdownMenu>
      </Dropdown>
    );
  }
}


DropDownMenu.propTypes = {
  logout: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default DropDownMenu;
