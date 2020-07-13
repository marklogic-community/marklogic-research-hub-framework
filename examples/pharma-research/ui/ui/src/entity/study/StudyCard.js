import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const StudyCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.summary} />}
      </div>
      {props.children}
    </div>
  );
};

export default StudyCard;
