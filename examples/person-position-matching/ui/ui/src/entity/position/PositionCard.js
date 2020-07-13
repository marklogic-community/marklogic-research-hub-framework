import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const PositionCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.description} />}
      </div>
      <div>
        <strong>Required Skills: </strong>
        {
          props.entity.requiredSkill.join(', ')
        }
      </div>
      {props.children}
    </div>
  );
};

export default PositionCard;
