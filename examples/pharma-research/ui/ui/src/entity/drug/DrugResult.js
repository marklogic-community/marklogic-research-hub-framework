import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import DrugCard from './DrugCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const DrugResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <DrugCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </DrugCard>
    </GenericEntityCard>
  );
};

DrugResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

DrugResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default DrugResult;
