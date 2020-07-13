import React, { useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const CurrentFilter = ({
  filter,
  removeFilter,
}) => {
  let revisedDateConstraintName = '';
  if (filter.mode === 'or' && filter.constraint === 'revisedDate') {
    if (filter.value.length > 1) {
      revisedDateConstraintName =
        filter.value[filter.value.length - 1] + ' - ' + filter.value[0];
    } else if (filter.value.length === 1) {
      revisedDateConstraintName = filter.value[0];
    }
  }

  return (
    <div
      className="grove-current-filter"
    >
      {filter.mode === 'or' && filter.constraint === 'revisedDate' ? (
        <OverlayTrigger
          overlay={
            <Tooltip id={`current-or-filter-${filter.constraint}`}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {filter.value.map(v => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </Tooltip>
          }
          placement="right"
        >
          <div
            key={'OR-' + filter.constraint}
            className="cf-button"
            style={{ cursor: 'pointer' }}
            onClick={removeFilter.bind(null, filter.constraint, filter.value, {
              boolean: filter.mode
            })}
          >
            <i className="glyphicon glyphicon-remove-circle icon-white ml-facet-remove-filter" />
            &nbsp;
            <span title={filter.constraint}>
              {filter.constraint}: {revisedDateConstraintName}
            </span>
          </div>
        </OverlayTrigger>
      ) : (
        filter.value.map(value => {
          return (
            <div
              key={filter.constraint + value}
              className="cf-button"
              style={{ cursor: 'pointer' }}
              onClick={removeFilter.bind(null, filter.constraint, value, {
                boolean: filter.mode
              })}
            >
              <i className="glyphicon glyphicon-remove-circle icon-white ml-facet-remove-filter" />
              &nbsp;
              <span title={value}>
                {filter.constraint}: {value}{' '}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CurrentFilter;
