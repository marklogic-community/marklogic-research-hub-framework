import React from 'react';
import { Row, Col } from 'react-bootstrap';

import EntityContainer from '../containers/EntityContainer';

const EntityComponentList = ({ entities }) => {
  return (
    <Row>
      {entities.map((entity, index) => {
        if (entity) {
          return (
            <Col className="ml-search-result" md={12} key={index}>
              <EntityContainer
                type={entity.type}
                name={entity.name}
                id={entity.id}
              />
            </Col>
          );
        }
        return null;
      })}
    </Row>
  );
};

export default EntityComponentList;
