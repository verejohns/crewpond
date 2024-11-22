import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactSelect, {components} from "react-select";

// handle options group header click event
// hide and show the options under clicked group
const handleHeaderClick = id => {
    const node = document.querySelector(`#${id}`).parentElement
      .nextElementSibling;
    const classes = node.classList;
    if (classes.contains("expand")) {
      node.classList.remove("expand");
    } else {
      node.classList.add("expand");
    }
  };

const CustomGroupHeading = props => {
    return (
      <div
        className="group-heading-wrapper"
        onClick={() => handleHeaderClick(props.id)}
      >
        <components.GroupHeading {...props} />
      </div>
    );
  };

class Select extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { small, dark, customClassName } = this.props;

        return (
            <React.Fragment>
                <ReactSelect
                    {... this.props}
                    className={`select-container${small ? ' sm-size' : ''}${dark ? ' dark-theme' : ''} ${customClassName}`}
                    classNamePrefix="select"
                    components={{ GroupHeading: CustomGroupHeading }}
                />
            </React.Fragment>
        );
    }
}

Select.propTypes = {
    options: PropTypes.array.isRequired,
    name: PropTypes.name,
    placeholder: PropTypes.string,
    customClassName: PropTypes.string,
    small: PropTypes.bool,
    dark: PropTypes.bool,
    defaultValue: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func
};

export default Select;
