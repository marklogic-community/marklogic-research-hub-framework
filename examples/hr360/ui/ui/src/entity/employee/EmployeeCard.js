import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const EmployeeCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.description} />}
      </div>
      <div>
        <strong>Location: </strong>
        {props.entity.city}, {props.entity.state}
      </div>
      <div>
        <strong>Job Status: </strong>
        {
          props.entity.jobStatus
        }
      </div>
      {props.children}
    </div>
  );
};

export default EmployeeCard;
