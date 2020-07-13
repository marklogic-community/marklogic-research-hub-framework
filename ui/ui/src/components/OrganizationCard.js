import React from 'react';
import { Row, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './OrganizationCard.css';

const OrganizationCard = props => (
  <Panel bsStyle="info" style={{ height: '200px', overflow: 'hidden' }}>
    {props.top}
    <Link
      to={{
        pathname: '/',
        state: { id: props.org.id },
        search: `?=${props.org.id}`
      }}
      style={{ textDecoration: 'none' }}
    >
      <Row className="row-no-gutters">
        <div className="col-md-12">
          <h5>{props.org.label}</h5>
        </div>
      </Row>
      {props.children}
    </Link>
  </Panel>
);

export default OrganizationCard;
