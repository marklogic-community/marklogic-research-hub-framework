import { combineReducers } from 'redux';
import * as types from '../actionTypes';

const stagedEntities = (state = [], action) => {
  switch (action.type) {
    case types.STAGE_ENTITY:
      if (state.some(entity => entity.id === action.payload.entity.id)) {
        return state;
      }
      return [...state, action.payload.entity];
    case types.UNSTAGE_ENTITY:
      return state.filter(entity => entity.id !== action.payload.entityId);
    default:
      return state;
  }
};

const activeWorkspace = (state = null, action) => {
  switch (action.type) {
    case types.ACTIVATE_WORKSPACE:
      return { fetching: action.payload };
    case types.ACTIVE_WORKSPACE_ERROR:
      return { fetching: false, error: action.payload };
    case types.ACTIVE_WORKSPACE_DATA:
      return { ...action.payload, fetching: false, error: false };
    default:
      return state;
  }
};

const availableWorkspaces = (state = [], action) => {
  switch (action.type) {
    case types.AVAILABLE_WORKSPACES_DATA:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  stagedEntities,
  activeWorkspace,
  availableWorkspaces
});

export const selectors = {
  stagedEntities: state => state.stagedEntities,
  isStagedEntity: (state, id) =>
    state.stagedEntities.some(entity => entity.id === id),
  activeWorkspace: state => state.workspace.activeWorkspace,
  activeEntities: state =>
    state.workspace.activeWorkspace && state.workspace.activeWorkspace.entities,
  isActiveEntity: (state, id) =>
    state.workspace.activeWorkspace
      ? Object.keys(state.workspace.activeWorkspace.entities || {}).some(
          uri => uri === id
        )
      : false,
  availableWorkspaces: state => state.workspace.availableWorkspaces
};
