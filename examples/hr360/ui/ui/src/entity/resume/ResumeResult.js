import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import ResumeCard from './ResumeCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const ResumeResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <ResumeCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </ResumeCard>
    </GenericEntityCard>
  );
};

ResumeResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

ResumeResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default ResumeResult;
