import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import PositionCard from './PositionCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const PositionResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <PositionCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </PositionCard>
    </GenericEntityCard>
  );
};

PositionResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

PositionResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default PositionResult;
