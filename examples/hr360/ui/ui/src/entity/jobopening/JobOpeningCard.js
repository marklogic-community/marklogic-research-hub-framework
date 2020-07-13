import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const JobOpeningCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.description} />}
      </div>
      <div>
        <strong>Status: </strong>
        {
          props.entity.reqStatus
        }
      </div>
      {props.children}
    </div>
  );
};

export default JobOpeningCard;
