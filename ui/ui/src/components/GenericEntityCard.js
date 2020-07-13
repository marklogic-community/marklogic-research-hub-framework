import React from 'react';
import { Row, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Bookmark from 'components/Bookmark';
import { entityConfig } from 'entity';
import 'entity/Card.css';

const GenericEntityCard = props => {
  let entity = props.entity;
  let icon = props.icon || entityConfig[entity.type].class.getIcon();

  return (
    <Panel bsStyle="info" className="profile-card">
      {props.top}
      <Row className="row-no-gutters">
        <div className="col-md-12">
          <Link
            to={{
              pathname: `./${entity.type}`,
              state: { id: entity.id },
              search: `?id=${entity.id}`
            }}
            style={{ textDecoration: 'none' }}
          >
            <h2>
              <i className={icon} />
                &nbsp;
                {entity.preferredName || entity.id}
            </h2>
          </Link>
        </div>
      </Row>
      {props.children}
      <footer>
        <div className={`entity-type-badge entity-type-${entity.type}`}>{entity.type}</div>
        <Bookmark
          entity={{
            id: entity.id,
            uri: unescape(entity.id),
            type: entity.type,
            label: entity.preferredName
          }}
        />
        <button
          className="btn btn-danger btn-header"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            props.removeWorkspaceEntity('workspace', entity.id);
            ;
          }}
        >
           <i className="glyphicon glyphicon-trash" />
        </button>

      </footer>
    </Panel>
  );
};

export default GenericEntityCard;
