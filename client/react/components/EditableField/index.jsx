import React, { Component } from "react";
import PropTypes from "prop-types";
import $ from "jquery";

class EditableField extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            isEdit: false
        };
    }

    componentDidMount() {
        const {isEdit} = this.props;
        if(isEdit === true){
            this.setState({
                isEdit: true
            });
            $(this.mRef).find('.static-field').text($(this.mRef).find('.input-field').val());
        }
        $(this.mRef).find('.action').html(this.getActionIcon());
        $(this.mRef).find('.action').on("click", this.handleClick);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.isEdit !== this.state.isEdit) {
            this.setState({
                isEdit: this.props.isEdit
            });
            if(this.props.isEdit === true) {
                $(this.mRef).find('.static-field').text($(this.mRef).find('.input-field').val());
            }
        }
    }

    componentWillUnmount() {
        $(this.mRef).find('.action').off("click", this.handleClick);
    }

    handleClick = () => {
        if (this.state.isEdit)
            $(this.mRef).find('.static-field').text($(this.mRef).find('.input-field').val());

        $(this.mRef).find('div.static-field-wrap').toggleClass('show-on-edit');
        $(this.mRef).find('input.input-field').toggleClass('show-on-edit');
        $(this.mRef).find('textarea.input-field').toggleClass('show-on-edit');

        this.setState({
            isEdit: !this.state.isEdit
        });
    };

    getActionIcon = () => {
        const { type } = this.props;

        if (type === "1")
            return '<i class="fa fa-times show-on-edit" />' +
                '<i class="fa fa-pencil hide-on-edit" />';

        return '<img class="show-on-edit" src="/static/images/icons/icon-edit-gray.svg" alt="" />' +
            '<img class="hide-on-edit" src="/static/images/icons/icon-edit-green.svg" alt="" />';
    };

    render() {
        const { isEdit } = this.state;
        const { children, type } = this.props;

        return (
            <div className={`editable-field ${isEdit ? 'edit-mode' : 'read-mode'} ${type === "1" ? 'first-type' : 'second-type'}`} ref={ref => this.mRef = ref}>
                {children}
            </div>
        );
    }
}

EditableField.defaultProps = {
    isEdit: false
}

EditableField.propTypes = {
    type: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
    isEdit: PropTypes.bool
};

export default EditableField;
