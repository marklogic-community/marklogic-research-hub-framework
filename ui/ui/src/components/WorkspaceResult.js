import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from './SearchSnippets.js';
import WorkspaceCard from './WorkspaceCard.js';
import GenericEntityCard from 'components/GenericEntityCard.js';

const WorkspaceResult = props => {
  return (
    <GenericEntityCard entity={props.result.content.entity} icon="fas fa-briefcase">
      <WorkspaceCard entity={props.result.content.entity}>
        <Row>
          <Col md={12}>
            <SearchSnippets {...props} />
          </Col>
        </Row>
      </WorkspaceCard>
    </GenericEntityCard>
  );
};

WorkspaceResult.defaultProps = {
  content: SearchSnippets
};

WorkspaceResult.propTypes = {
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default WorkspaceResult;
