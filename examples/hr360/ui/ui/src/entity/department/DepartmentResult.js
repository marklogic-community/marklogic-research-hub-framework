import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import DepartmentCard from './DepartmentCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const DepartmentResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <DepartmentCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </DepartmentCard>
    </GenericEntityCard>
  );
};

DepartmentResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

DepartmentResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default DepartmentResult;
