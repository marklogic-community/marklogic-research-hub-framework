import React from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
} from 'react-bootstrap';
import { CardResult } from '@marklogic-community/grove-core-react-components';
import ListResult from './ListResult';
import Bookmark from 'components/Bookmark';

import './SearchResults.css';

const DefaultNoResults = () => (
  <Col md={12}>
    <p>
      <br />
      <strong>No results matched your search.</strong>
    </p>
  </Col>
);

class SearchResults extends React.Component {
  constructor(props) {
    super(props);
    const resultComponentName = props.resultComponent ? '' : 'Cards';
    this.state = {
      resultComponentName: resultComponentName,
      resultComponent: props.resultComponent || CardResult
    };
    this.setResultType = this.setResultType.bind(this);
  }

  setResultType(e) {
    let resultComponent;
    if (e === 'Cards') {
      resultComponent = CardResult;
    } else if (e === 'List') {
      resultComponent = ListResult;
    } else {
      throw 'Invalid Result Type: ' + e;
    }
    this.setState({
      resultComponentName: e,
      resultComponent: resultComponent
    });
  }

  renderResult(result) {
    return (
      <Col md={12} key={result.id} className="ml-search-result">
        <Col md={1} className="entity-icon">
          <Bookmark
            entity={{
              id: result.id,
              uri: result.uri,
              label: result.content.preferredName,
              type: this.props.entityName
            }}
          />
        </Col>
        <this.state.resultComponent
          addFilter={this.props.addFilter}
          result={result}
          entity={result.content.entity}
          setUberFacet={this.props.setUberFacet}
          resultComponent={this.state.resultComponent}
        />
      </Col>
    );
  }

  render() {
    if (!this.props.results) {
      return null;
    }
    // For now, if you provide a resultComponent, we suppress the choice among
    // various types, though I could imagine letting the user specify > 1
    return (
      <div style={{ marginTop: '5px' }}>
        <Row className="ml-search-results">
          <Col md={12}>
            {this.props.results.map(result => this.renderResult(result))}
            {this.props.results.length === 0 && <this.props.noResults />}
          </Col>
        </Row>
      </div>
    );
  }
}

SearchResults.defaultProps = {
  noResults: DefaultNoResults
};

SearchResults.propTypes = {
  resultComponent: PropTypes.func,
  ooResults: PropTypes.func,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string
    })
  ).isRequired
};

export default SearchResults;
