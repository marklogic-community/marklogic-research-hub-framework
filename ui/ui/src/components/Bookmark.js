import React from 'react';
import EntityWorkspaceConnector from '../containers/EntityWorkspaceConnector';
import { selectors } from '../workspace-redux';
import { connect } from 'react-redux';

const Bookmark = props =>
  props.isSelected ? (
    <i
      className={'fas fa-bookmark staged-entity ' + props.additionalClassNames}
      onClick={e => {
        e.stopPropagation();
        props.unstageEntity(props.entity.id);
      }}
    />
  ) : (
    <i
      className={'far fa-bookmark ' + props.additionalClassNames}
      onClick={e => {
        e.stopPropagation();
        props.stageEntity(props.entity);
      }}
    />
  );

export default EntityWorkspaceConnector(
  connect((state, ownProps) => ({
    isActive: selectors.isActiveEntity(state, ownProps.entity.uri)
  }))(Bookmark)
);
