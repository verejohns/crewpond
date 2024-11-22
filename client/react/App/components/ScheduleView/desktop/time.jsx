import React, { useState } from 'react';
import { useDrop } from 'react-dnd';

import Avatar from './avatar';
import {constant, paths} from '../../../../../../utils';

export default ({ begin, end, schedule, user, cellWidth, pos, length, updateSchedule, onClick, history }) => {
    const { name, jobbers, unpublished } = schedule;
    const authUser = JSON.parse(localStorage.getItem(constant.LOGGED_ACCOUNT));
    const [opened, setOpened] = useState(false);
    const canAssignJobber = jobberId => {
        return jobbers.filter(jobber => jobber.id === jobberId).length === 0
    };

    const assignJobber = jobber => {
        updateSchedule({
            ...schedule,
            jobbers: [...jobbers, jobber],
            unpublished: true
        })
    };

    const setOpenToggle = (ev, opened) => {
        ev.stopPropagation();
        setOpened(opened);
    };

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: user.id === authUser.id ? 'jobber' : 'none',
        drop: (item) => assignJobber(item.jobber),
        canDrop: (item) => canAssignJobber(item.jobber.id),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        }),
    });

    return (
        <div
            ref={drop}
            className={`schedule-time${cellWidth * length <= 100 ? ' minimized' : ''}${unpublished ? ' unpublished' : ''}${jobbers.length === 0 ? ' opened' : ''}`}
            style={{ left: `${cellWidth * pos}px`, width: `${cellWidth * length - 6}px` }}
            onClick={onClick}
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
            {jobbers.length > 0 && (
                <div className="assignees">
                    {opened && (
                        <div className="list">
                            {jobbers.map(jobber => (
                                <Avatar
                                    url={jobber.avatar}
                                    onClick={() => history.push(paths.build(paths.client.APP_JOBBER_PROFILE, jobber.id))}
                                />
                            ))}
                        </div>
                    )}
                    <div className="toggle" onClick={(ev) => setOpenToggle(ev, !opened)}>
                        <Avatar />
                    </div>
                </div>
            )}
        </div>
    );
}
