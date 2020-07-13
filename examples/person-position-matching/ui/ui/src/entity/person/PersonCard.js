import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const PersonCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.name} />}
      </div>
      <div>
        <strong>Birthdate: </strong>
        { props.entity.birthdate + ', ' }
        <strong>Skills: </strong>
        {
          props.entity.skill.join(', ')
        }
      </div>
      {props.children}
    </div>
  );
};

export default PersonCard;
