import React, { Component } from 'react';
import DesktopView from './desktop';
import MobileView from './mobile';

class ScheduleView extends Component {
    constructor(props) {
        super(props);

        // Set Initial State
        this.state = {
            windowWidth: window.innerWidth
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize)
    }

    handleResize = () => {
        this.setState({
            windowWidth: window.innerWidth
        })
    };

    render() {
        const { windowWidth } = this.state;

        if (windowWidth < 768) {
            return (
                <MobileView />
            );
        }
        return (
            <DesktopView />
        );
    }
}

export default ScheduleView;
