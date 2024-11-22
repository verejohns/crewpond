import React, { Component } from "react";
import PropTypes from "prop-types";
import PerfectScrollbar from "react-perfect-scrollbar";

class Slider extends Component {
    componentDidMount() {
        document.body.style["padding-right"] = (window.innerWidth - document.body.clientWidth) + "px";
        document.body.classList.add('modal-open');

        setTimeout(() => {
            this.contentRef.setAttribute("style", "opacity: 1;-webkit-transform: translateX(0);transform: translateX(0);");
        }, 1);
    }

    componentWillUnmount() {
        document.body.classList.remove('modal-open');
        document.body.removeAttribute("style");
    }

    handleUnmount = () => {
        const { onUnmount } = this.props;

        this.backDrop.remove();
        this.contentRef.removeAttribute("style");
        setTimeout(() => {
            onUnmount();
        }, 400);
    };

    preventUnmount = (ev) => {
        return ev.stopPropagation();
    };

    render() {
        const { children, position } = this.props;

        return (
            <div className={`slider fixed-${position}`} onClick={this.handleUnmount}>
                <div className="backdrop" ref={ref => this.backDrop = ref} />

                <div className="slider-content" onClick={this.preventUnmount} ref={ref => this.contentRef = ref}>
                    <PerfectScrollbar
                        options={{
                            suppressScrollX: true
                        }}
                    >
                        <button className="btn btn-icon btn-default slider-close" onClick={this.handleUnmount}>
                            <i className="fa fa-angle-right" />
                        </button>
                        <div className="slider-content-inner">
                            {children}
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
        );
    }
}

Slider.defaultProps = {
    position: 'right'
};

Slider.propTypes = {
    position: PropTypes.string.isRequired,
    onUnmount: PropTypes.func.isRequired
};

export default Slider;
