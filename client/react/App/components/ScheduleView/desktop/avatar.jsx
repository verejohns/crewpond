import React, { Component } from 'react';

class Avatar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        }
    }

    handleClick = (ev) => {
        const { onClick } = this.props;

        if (onClick) {
            ev.stopPropagation();
            onClick(ev);
        }
    };

    render() {
        const { url } = this.props;
        const { loaded } = this.state;

        if (!url) {
            return (
                <img src="/static/images/avatar.png" alt="" onClick={this.handleClick} />
            );
        }
        return (
            <React.Fragment>
                {loaded || <img src="/static/images/avatar.png" alt="" onClick={this.handleClick} /> }
                <div className={`avatar${loaded ? '' : ' d-none'}`}>
                    <img src={url} alt="" onLoad={() => this.setState({ loaded: true })} onClick={this.handleClick} />
                </div>
            </React.Fragment>
        )
    }
}

export default Avatar;
