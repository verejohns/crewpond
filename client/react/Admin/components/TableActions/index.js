import React from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import connect from 'react-redux/es/connect/connect';

class TableActions extends React.Component {
    constructor(props){
        super(props);
    
        this.state = {
            dropdownOpen: false
        }
        this.toggle = this.toggle.bind(this);
        this.handleAction = this.handleAction.bind(this);
    }
    
    handleAction(event) {
        const { handleAction, item } = this.props;
        const id = event.target.id;
        handleAction(id, item);
    }

    toggle(){
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }
    
    render(){
        const { item, type, actions } = this.props;
        return(
            <ButtonDropdown direction={'down'} className="table-action-dropdown" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle className="table-action-button" caret>
                    Action
                </DropdownToggle>
                <DropdownMenu>
                {
                    actions.map((action, key) => {
                        if(action.id === 'action-hide'){
                            if(!item.is_hided)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else
                                return null;
                        }else if(action.id === 'action-show'){
                            if(item.is_hided)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else
                                return null;
                        }else if(action.id === 'action-suspend'){
                            if(!item.is_suspended)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else
                                return null
                        }else if(action.id === 'action-cancel'){
                            if(!item.is_cancelled)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else
                                return null
                        }else if(action.id === 'action-resume') {
                            if(item.is_suspended)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else if(item.is_cancelled)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else 
                                return null
                        }else if(action.id === 'action-verify') {
                            if(!item.confirmed_at)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else 
                                return null
                        }else if(action.id === 'action-complete') {
                            if(!item.is_completed)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else 
                                return null
                        }else if(action.id === 'action-uncomplete') {
                            if(item.is_completed)
                                return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                            else 
                                return null
                        }else {
                            return <DropdownItem key={key} id={action.id} onClick={this.handleAction}>{action.label}</DropdownItem>
                        }
                        
                    })
                }
                </DropdownMenu>
            </ButtonDropdown>

        )
    }
}

TableActions.defaultProps = {
    item: null,
    type: 'user',
    actions: []
};
TableActions.propTypes = {
    handleAction: PropTypes.func,
    item: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    actions: PropTypes.array.isRequired,
};
export default TableActions;
