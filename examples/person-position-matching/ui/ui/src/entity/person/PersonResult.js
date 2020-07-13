import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import PersonCard from './PersonCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const PersonResult = ({ result, entity, ...props }) => {
  return (
    <GenericEntityCard entity={entity} detailPath={props.detailPath}>
      <PersonCard entity={entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
      </PersonCard>
    </GenericEntityCard>
  );
};

PersonResult.defaultProps = {
  content: SearchSnippets,
  detailPath: '/detail'
};

PersonResult.propTypes = {
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default PersonResult;
