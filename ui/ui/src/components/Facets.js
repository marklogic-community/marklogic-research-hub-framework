import React from 'react';
import PropTypes from 'prop-types';

import CurrentFilters from './CurrentFilters';
import { SingleFilterList } from '@marklogic-community/grove-core-react-components';
import HistogramFacet from './HistogramFacet';
import MultiFacetGroup from './MultiFacetGroup';

// TODO: truncate names with a truncateLength option
// TODO: handle blank values
const Facets = ({
  activeFilters,
  availableFilters,
  addFilter,
  removeFilter,
  replaceFilter,
  uberFacet
}) => (
  <div className="ml-facet-list list-group">
    {
      // TODO - this was when facets should be negatible?
      // Example of passing in attribute to change component behavior?
      // <ml-chiclets
      //   ng-if="shouldNegate"
      //   active-facets="activeFacets"
      //   toggle="toggle({facet:facet, value:value})"
      //   truncate="{{ truncateLength }}"></ml-chiclets>
    }
    {!!activeFilters &&
      activeFilters.length > 0 && (
        <div className="ml-facet">
          <h3 className="panel-title" style={{ marginBottom: '8px' }}>
            Current Filters
          </h3>
          <CurrentFilters
            filters={activeFilters}
            removeFilter={removeFilter}
          />
          <hr />
        </div>
      )}
    {availableFilters &&
      Object.keys(availableFilters)
        .filter(facetName => {
          return availableFilters[facetName].facetValues;
        })
        .map(facetName => {
          let selectedValues;
          const activeFilter = activeFilters.find(
            filter => filter.constraint === facetName
          );
          if (activeFilter) {
            selectedValues = activeFilter.value;
          }
          return (
            <div key={facetName} className="ml-facet">
              <h3 className="panel-title" style={{ marginBottom: '8px' }}>
                {facetName
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, function(str) {
                    return str.toUpperCase();
                  })
                  .replace(/-/g, '')}
              </h3>
              <div>
                {facetName === 'revisedDate' ? (
                  <HistogramFacet
                    searchContext={uberFacet}
                    facetName={facetName}
                    activeFilters={activeFilters}
                    replaceFilter={replaceFilter.bind(
                      null,
                      facetName,
                      availableFilters[facetName].type || null
                    )}
                    addFilter={addFilter.bind(
                      null,
                      facetName,
                      availableFilters[facetName].type || null
                    )}
                    removeFilter={removeFilter.bind(null, facetName)}
                  />
                ) : facetName === 'single' ? ( // if we want any specific facets to be single instead of multi
                  <>
                    <SingleFilterList
                      values={availableFilters[facetName].facetValues}
                      selectedValues={selectedValues}
                      addFilter={addFilter.bind(
                        null,
                        facetName,
                        availableFilters[facetName].type || null
                      )}
                      removeFilter={removeFilter.bind(null, facetName)}
                    />
                  </>
                ) : (
                  <>
                    <MultiFacetGroup
                      searchContext={uberFacet}
                      facetName={facetName}
                      activeFilters={activeFilters}
                      replaceFilter={replaceFilter.bind(
                        null,
                        facetName,
                        availableFilters[facetName].type || null
                      )}
                      removeFilter={removeFilter.bind(null, facetName)}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
  </div>
);

Facets.propTypes = {
  activeFilters: PropTypes.array.isRequired,
  addFilter: PropTypes.func.isRequired,
  availableFilters: PropTypes.object,
  removeFilter: PropTypes.func.isRequired
};

export default Facets;
