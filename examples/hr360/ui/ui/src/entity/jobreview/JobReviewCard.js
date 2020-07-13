import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const JobReviewCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.description} />}
      </div>
      <div>
        <strong>Reviewer: </strong>
        {
          props.entity.reviewer
        }
      </div>
      {props.children}
    </div>
  );
};

export default JobReviewCard;
