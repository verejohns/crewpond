import React from 'react';

export default ({ name, begin, end, cellWidth, pos, length, jobbers }) => (
    <div
        className={`schedule-time${cellWidth * length <= 100 ? ' minimized' : ''}${jobbers.length === 0 ? ' opened' : ''}`}
        style={{ left: `${cellWidth * pos}px`, width: `${cellWidth * length - 6}px` }}
    >
        <div className="schedule-info">
            {cellWidth * length > 100 && (
                <div className="name">{name}</div>
            )}
            <div className="time">
                <span>{begin}</span>
                <span>-</span>
                <span>{end}</span>
            </div>
        </div>
    </div>
);
