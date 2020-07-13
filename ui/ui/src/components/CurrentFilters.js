import React from 'react';
import PropTypes from 'prop-types';

import TransitionGroup from 'react-transition-group/TransitionGroup';
import { Fade } from '@marklogic-community/grove-core-react-components';

import { some } from 'lodash';

import CurrentFilter from './CurrentFilter';

// TODO: truncate values with a truncateLength option
const CurrentFilters = ({
  filters,
  removeFilter,
}) => {
  return (
    <TransitionGroup className="chiclets" appear={true}>
      {filters.map(filter => {
        if (
          some(
            filter.value,
            value => !(typeof value === 'string' || typeof value === 'number')
          )
        ) {
          return null;
        }
        return (
          <Fade key={filter.constraint + filter.mode}>
            <CurrentFilter
              filter={filter}
              removeFilter={removeFilter}
            />
          </Fade>
        );
      })}
    </TransitionGroup>
  );
};

CurrentFilters.propTypes = {
  filters: PropTypes.array.isRequired,
  removeFilter: PropTypes.func.isRequired
};

export default CurrentFilters;
