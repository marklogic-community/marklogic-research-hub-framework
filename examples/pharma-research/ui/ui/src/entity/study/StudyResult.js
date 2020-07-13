import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import StudyCard from './StudyCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const StudyResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity}>
      <StudyCard entity={entity}>
        <Row>
          <Col md={12}>
            <h6>Study Ids: {entity.studyIds}</h6>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </StudyCard>
    </GenericEntityCard>
  );
};

StudyResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

StudyResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default StudyResult;
