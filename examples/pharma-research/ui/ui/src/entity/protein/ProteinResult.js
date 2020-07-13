import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import ProteinCard from './ProteinCard.js';
import HighlightMatch from 'components/HighlightMatch';
import GenericEntityCard from 'components/GenericEntityCard.js';

const ProteinResult = ({ result, entity, ...props }) => {
  const label = result.highlightedLabel ? (
    <HighlightMatch match={result.highlightedLabel} />
  ) : (
    result.label
  );
  return (
    <GenericEntityCard entity={entity}>
      <ProteinCard
        entity={entity}
        id={result.id}
        label={label}
      >
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </ProteinCard>
    </GenericEntityCard>
  );
};

ProteinResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

ProteinResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default ProteinResult;
