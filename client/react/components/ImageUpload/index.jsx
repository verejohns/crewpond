import React, { Component } from "react";
import PropTypes from "prop-types";

class ImageUpload extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = () => {
        const {disabled} = this.props;
        if(!disabled)
            this.fileInput.click();
    };

    render() {
        const { name, onChange, avatar, type } = this.props;
        let opts = {};
        if (name)
            opts.name = name;
        if (onChange)
            opts.onChange = onChange;

        return (
            <div className={"upload-widget" + (!avatar?' no-border':'')} onClick={this.handleClick}>
                <img src={!avatar?(type==="user"?"/static/images/avatar.png":"/static/images/job_avatar.png"):avatar} alt="" />
                <input type="file" className="d-none" accept="image/x-png,image/jpg,image/jpeg" {...opts} ref={ref => this.fileInput = ref} />
            </div>
        );
    }
}

ImageUpload.defaultProps = {
    avatar: null,
    disabled: false,
    type: 'user'
};

ImageUpload.propTypes = {
    avatar: PropTypes.string,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    type: PropTypes.string
};

export default ImageUpload;
