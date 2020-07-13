import React from 'react';
import AddToWorkspaceButton from './AddToWorkspaceButton';
import WorkspaceNavigator from './WorkspaceNavigator';
import { Row, Col } from 'react-bootstrap';

const DetailViewHeader = props => {
  return (
    <Row className="detail-header">
      <Col md={4}>
        <WorkspaceNavigator />
      </Col>
      <Col md={4} className="text-center">
        <AddToWorkspaceButton openModal={props.openAddToCaseModal} />
      </Col>
      <Col md={4} className="text-right detail-toggle">
        {props.viewName === 'detail' && (
          <button
            className="trigger"
            title="show graph"
            aria-label="show graph"
            onClick={() => props.changeView('graph')}
          >
            <i className="fa fa-project-diagram" /> Graph view
          </button>
        )}
        {props.viewName === 'graph' && (
          <button
            className="trigger"
            title="show detail"
            aria-label="show detail"
            onClick={() => props.changeView('detail')}
          >
            <i className="fa fa-list" /> Detail view
          </button>
        )}
      </Col>
    </Row>
  );
};

export default DetailViewHeader;
