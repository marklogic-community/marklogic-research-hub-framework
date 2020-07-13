import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import JobReviewCard from './JobReviewCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const JobReviewResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <JobReviewCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </JobReviewCard>
    </GenericEntityCard>
  );
};

JobReviewResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

JobReviewResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default JobReviewResult;
