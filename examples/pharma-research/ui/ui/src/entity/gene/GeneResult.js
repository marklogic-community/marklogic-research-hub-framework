import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import GeneCard from './GeneCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const GeneResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity}>
      <GeneCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </GeneCard>
    </GenericEntityCard>
  );
};

GeneResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

GeneResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default GeneResult;
