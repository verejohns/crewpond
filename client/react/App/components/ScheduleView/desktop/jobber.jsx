import React from 'react';
import { withRouter } from 'react-router-dom';
import { useDrag } from 'react-dnd'

import Avatar from './avatar';
import { Score } from '../../../../components';
import { paths } from '../../../../../../utils';
import CommentIcon from '../../../../icons/comment.svg';
import BriefcaseIcon from '../../../../icons/briefcase.svg';
import StarIcon from '../../../../icons/star.svg';

const Jobber = props => {
    const { id, avatar, first_name, last_name, company, review, is_favorite, onFavorite, onChat } = props;
    const [{ isDragging }, drag] = useDrag({
        item: { type: 'jobber', jobber: props },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div className="jobber-row">
            <div
                ref={drag}
                className="drag-container"
                style={{
                    opacity: isDragging ? 0.5 : 1
                }}
            >
                <Avatar url={avatar} />
            </div>
            <div className="jobber-info">
                <div className="name">{`${first_name} ${last_name}`}</div>
                {company && (
                    <div className="company mt-1">{company}</div>
                )}
                {review.score === null ? (
                    <div className="col-green small mt-1">New!</div>
                ) : (
                    <Score score={review.score} />
                )}
            </div>
            <div className="action">
                <span className="action-item" onClick={() => onChat(id)}>
                    <CommentIcon/>
                </span>
                <span className="action-item" onClick={() => props.history.push(paths.build(paths.client.APP_JOBBER_PROFILE, id))}>
                    <BriefcaseIcon/>
                </span>
                <span className={`action-item${is_favorite ? ' active' : ''}`} onClick={() => onFavorite(id, !is_favorite)}>
                    <StarIcon/>
                </span>
            </div>
        </div>
    )
};

export default withRouter(Jobber);