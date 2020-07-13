import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Pagination, Button } from 'react-bootstrap';
import _ from 'lodash';

import { SearchMetrics } from '@marklogic-community/grove-core-react-components';
import SearchResults from './SearchResults';

function hasHighlights(node) {
  if (Array.isArray(node)) {
    return (
      node.filter(item => {
        return hasHighlights(item);
      }, this).length > 0
    );
  } else if (_.isPlainObject(node)) {
    return (
      Object.keys(node).filter(key => {
        if (key === 'highlight') {
          return true;
        } else {
          return hasHighlights(node[key]);
        }
      }, this).length > 0
    );
  } else {
    return false;
  }
}

const removeSnippetsWithoutHighlights = results => {
  if (results) {
    return results.map(result => {
      if (result.matches && !hasHighlights(result.matches)) {
        const { matches, ...resultWithoutMatches } = result;
        return resultWithoutMatches;
      }
      return result;
    });
  }
};

const SearchResponseView = props => {
  return (
    <Row>
      <Col md={12}>
        <div className="well">
          <Row>
            {props.error ? (
              <Col md={12}>
                <p>
                  <strong>There was an error performing your search.</strong>
                </p>
                <p>
                  The server sent the following error message:&nbsp;
                  <span className="text-danger">{props.error}</span>
                </p>
              </Col>
            ) : (
              !props.isSearchPending && (
                <Col md={12}>
                  <Row className="search-metrics">
                    <Col md={12}>
                      <SearchMetrics
                        time={props.executionTime}
                        total={props.total}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <SearchResults
                      addFilter={props.addFilter}
                      selectedEntities={props.selectedEntities}
                      results={
                        removeSnippetsWithoutHighlights(props.results) || []
                      }
                      entityName={props.entityName}
                      resultComponent={props.resultComponent}
                      setUberFacet={props.setUberFacet}
                    />
                  </Row>

                  <Row>
                    {props.isCurrentUberFacet &&
                      props.totalPages > 1 && (
                        <Pagination
                          items={props.totalPages}
                          maxButtons={10}
                          boundaryLinks={true}
                          activePage={props.page}
                          onSelect={props.handlePageSelection}
                        />
                      )}
                    {!props.isCurrentUberFacet &&
                      props.total > 0 && (
                        <Button
                          type="submit"
                          bsSize="small"
                          className="primary bright-purple-accent-bg bright-purple-accent-bd white-fg"
                          onClick={() =>
                            props.setUberFacet(props.uberFacetType)
                          }
                        >
                          See more <span>{props.uberFacetType}</span>
                        </Button>
                      )}
                  </Row>
                </Col>
              )
            )}
          </Row>
        </div>
      </Col>
    </Row>
  );
};

SearchResponseView.propTypes = {
  error: PropTypes.string,
  results: PropTypes.array,
  executionTime: PropTypes.number,
  total: PropTypes.number,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  handlePageSelection: PropTypes.func
};

export default SearchResponseView;
