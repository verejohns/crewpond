import React from 'react';

export default () => (
    <div className='loader-wrapper'>
        <div className="loader">
            <div className="cube-folding">
                <span className="leaf1"/>
                <span className="leaf2"/>
                <span className="leaf3"/>
                <span className="leaf4"/>
            </div>
            <span className="loader-text">Loading ...</span>
        </div>
    </div>
);
