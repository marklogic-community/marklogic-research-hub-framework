import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import JobOpeningCard from './JobOpeningCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const JobOpeningResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <JobOpeningCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </JobOpeningCard>
    </GenericEntityCard>
  );
};

JobOpeningResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

JobOpeningResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default JobOpeningResult;
