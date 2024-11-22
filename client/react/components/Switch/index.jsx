import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactSwitch from "react-switch";

class Switch extends Component {
    onChange = (checked) => {
        if (this.props.onChange)
            this.props.onChange(checked);
    };

    render() {
        const { name, disabled, checked } = this.props;
        let input = null;
        if (name)
            input = <input type="hidden" name={name} value={checked} />;

        return (
            <React.Fragment>
                <ReactSwitch
                    checked={checked}
                    onChange={this.onChange}
                    height={25}
                    width={44}
                    handleDiameter={21}
                    onColor="#00dd8c"
                    offColor="#e7eef2"
                    checkedIcon={false}
                    uncheckedIcon={false}
                    boxShadow="0px 1px 2px rgba(0,0,0,0.5)"
                    disabled={disabled}
                />
                {input}
            </React.Fragment>
        )
    }
}

Switch.defaultProps = {
    checked: false,
    disabled: false
};

Switch.propTypes = {
    checked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    name: PropTypes.string,
    onChange: PropTypes.func
};

export default Switch;
