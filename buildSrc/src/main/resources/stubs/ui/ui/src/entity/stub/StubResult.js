import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import StubCard from './StubCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const StubResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <StubCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </StubCard>
    </GenericEntityCard>
  );
};

StubResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

StubResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default StubResult;
