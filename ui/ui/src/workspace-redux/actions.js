import * as types from './actionTypes';

export const stageEntity = entity => {
  return {
    type: types.STAGE_ENTITY,
    payload: { entity }
  };
};

export const unstageEntity = entityId => {
  return {
    type: types.UNSTAGE_ENTITY,
    payload: { entityId }
  };
};

export const unstageAllEntities = stagedEntities => {
  return dispatch => {
    stagedEntities.forEach(stagedEntity => {
      dispatch(unstageEntity(stagedEntity.id));
    });
  };
};

export const fetchActiveWorkspace = workspaceId => {
  return {
    type: types.ACTIVATE_WORKSPACE,
    payload: workspaceId
  };
};

export const activeWorkspaceData = payload => {
  return {
    type: types.ACTIVE_WORKSPACE_DATA,
    payload: payload
  };
};

export const activeWorkspaceError = payload => {
  return {
    type: types.ACTIVE_WORKSPACE_ERROR,
    payload: payload
  };
};

export const activateWorkspace = workspaceId => {
  return dispatch => {
    dispatch(fetchActiveWorkspace(workspaceId));
    fetch(
      new URL(
        '/v1/resources/workspaceDetails?rs:id=' +
          encodeURIComponent(workspaceId),
        document.baseURI
      ).toString(),
      { credentials: 'same-origin' }
    ).then(response => {
      if (response.ok) {
        response.json().then(workspaceData => {
          dispatch(activeWorkspaceData(workspaceData));
        });
      } else {
        dispatch(activeWorkspaceError(response.statusText));
      }
    });
  };
};

export const availableWorkspacesData = payload => {
  return {
    type: types.AVAILABLE_WORKSPACES_DATA,
    payload: payload
  };
};

export const fetchAvailableWorkspaces = () => dispatch => {
  fetch(new URL('/v1/resources/workspaces', document.baseURI).toString(), {
    credentials: 'same-origin'
  }).then(response => {
    if (response.ok) {
      response.json().then(responseJson => {
        dispatch(availableWorkspacesData(responseJson.results));
      });
    } else {
      console.warn('Error loading available workspaces', response.statusText); //eslint-disable-line
    }
  });
};
