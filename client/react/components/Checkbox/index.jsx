import React, { Component } from "react";
import PropTypes from "prop-types";

class Checkbox extends Component {
    handleClick = () => {
        if (!this.props.disabled)
            this.checkRef.click();
    };

    render() {
        const { name, label, checked, defaultChecked, onChange, className } = this.props;
        let inputProps = { defaultChecked };
        if (name) {
            inputProps.name = name;
        }
        if (checked !== undefined) {
            inputProps.checked = checked;
        }
        if (onChange) {
            inputProps.onChange = onChange;
        }

        return (
            <div className={`custom-checkbox ${className}`}>
                <input type="checkbox" { ...inputProps } ref={ref => this.checkRef = ref}/>
                <label className="checkbox-inner" onClick={this.handleClick}>
                    <span>
                        <svg width="12px" height="10px" viewBox="0 0 12 10">
                          <polyline points="1.5 6 4.5 9 10.5 1"/>
                        </svg>
                    </span>
                    {label && (
                        <span>{label}</span>
                    )}
                </label>
            </div>
        )
    }
}

Checkbox.defaultProps = {
    defaultChecked: false
};

Checkbox.propTypes = {
    defaultChecked: PropTypes.bool.isRequired,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string
};

export default Checkbox;
