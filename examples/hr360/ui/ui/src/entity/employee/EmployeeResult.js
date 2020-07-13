import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import EmployeeCard from './EmployeeCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const EmployeeResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <EmployeeCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </EmployeeCard>
    </GenericEntityCard>
  );
};

EmployeeResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

EmployeeResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default EmployeeResult;
