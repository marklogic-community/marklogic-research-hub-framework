import React from 'react';
import { entityConfig } from 'entity';

const Icons = new Map(
  Object.keys(entityConfig).map(key => {
    return [key, entityConfig[key].class.getIcon()];
  }).concat([['workspace', 'fas fa-briefcase uf-icon']])
);

function capitalize(str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

function getEntityCountMetadata(entityList) {
  let countMeta = {};
  Object.keys(entityConfig).concat(['workspace']).forEach(key => {
    countMeta[key] = entityList.filter(entity => entity.type === key).length
  });
  return countMeta;
}

function generateListEntry(entityList, type) {
  return entityList
    .filter(entity => entity.type === type)
    .slice(0, 3)
    .map((entity, index) => {
      if (entity.preferredName.length >= 30) {
        return (
          <span className="label workspace-label" key={index}>
            <i className={Icons.get(type)} aria-hidden="true" />
            {entity.preferredName.substring(0, 27) + '...'}
          </span>
        );
      }
      return (
        <span className="label workspace-label" key={index}>
          <i className={Icons.get(type)} aria-hidden="true" />
          {entity.preferredName}
        </span>
      );
    });
}

function generateProminentEntities(entityList) {
  const countMetadata = getEntityCountMetadata(entityList);

  let prominentEntities = {};
  Object.keys(entityConfig).concat(['workspace']).forEach(key => {
    prominentEntities[key] = generateListEntry(entityList, key);
    if (countMetadata[key] > 3) {
      prominentEntities[key].push(
        <span className="label workspace-label" key={key +"More"}>
          ...
        </span>
      );
    }
  });
  return prominentEntities;
}

const ProminentEntities = props => {
  const entityList = Object.values(props.entity.entities);
  const countMetadata = getEntityCountMetadata(entityList);
  const listItems = generateProminentEntities(entityList);

  let entities = Object.keys(entityConfig).map(key => {
    return Section(entityConfig[key].plural, key, listItems[key], countMetadata);
  });

  // do workspaces separately because they aren't in entityConfig
  entities.push(Section('workspaces', 'workspace', listItems['workspace'], countMetadata));
  return entities;
};

function Section(label, name, list, count) {
  if (list && list.length > 0) {
    return (
      <div key={name}>
        <strong>
          {capitalize(label)} <span>({count[name]})</span>:
        </strong>
        <span>{list}</span>
      </div>
    );
  }
}

const WorkspaceCard = props => {

  let removeEntityButton;

  if (props.entity.removeEntity) {
    removeEntityButton = (
      <button
        className="btn btn-danger btn-header-right"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          let name = props.entity.label;
          props.entity.removeEntity('workspace', props.entity.id, name);
        }}
      >
        <i className="glyphicon glyphicon-trash" />
      </button>
    );
  }

  return (
    <div>
      {props.entity.description ? props.entity.description : ''}
      {props.entity && (
        <div className="profile-section">
          <ProminentEntities {...props} />
        </div>
      )}
      {props.children}
      {removeEntityButton}
    </div>
  );
};

export default WorkspaceCard;
