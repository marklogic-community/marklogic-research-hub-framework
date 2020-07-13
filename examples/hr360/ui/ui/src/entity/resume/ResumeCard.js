import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const ResumeCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.description} />}
      </div>
      <div><strong>Category</strong> <span>{props.entity.category}</span></div>
      {props.children}
    </div>
  );
};

export default ResumeCard;
