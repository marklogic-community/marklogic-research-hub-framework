import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import PublicationCard from './PublicationCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const PublicationResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity}>
      <PublicationCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </PublicationCard>
      </GenericEntityCard>
  );
};

PublicationResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

PublicationResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default PublicationResult;
