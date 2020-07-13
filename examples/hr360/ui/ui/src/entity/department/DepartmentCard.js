import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const DepartmentCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.description} />}
      </div>
      <div>
        <strong>Department Id: </strong>
        {
          props.entity.departmentId
        }
      </div>
      <div>
        <strong>Location: </strong>
        {
          props.entity.location
        }
      </div>
      {props.children}
    </div>
  );
};

export default DepartmentCard;
