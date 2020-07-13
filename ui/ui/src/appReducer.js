// import { coreAppReducer } from 'grove-core-react-redux-containers';
import { combineReducers } from 'redux';
import { createReducer as createSearchReducer } from '@marklogic-community/grove-search-redux';
import documents from '@marklogic-community/grove-crud-redux';
import graph from './graph-redux/reducer';
import workspace from './workspace-redux';
import user, { actionTypes } from './modified-grove-user-redux';
import { EntityRegistry } from 'entity';

const allEntitySearch = createSearchReducer({
  namespace: 'allEntitySearch'
});
const workspaceSearch = createSearchReducer({
  namespace: 'workspaceSearch'
});

const coreAppReducer = (state, action) => {
  // empty out state on logout, so we don't leak info
  if (action.type === actionTypes.LOCAL_LOGOUT) {
    state = { user: { isAuthStatusPending: false } };
  }

  let reducersMap = {};
  EntityRegistry.getAllClasses().forEach(entityClass => {
    const namespace = entityClass.getSearchReducerNamespace();
    reducersMap[namespace] = createSearchReducer({
      namespace: namespace
    })
  });

  reducersMap = { ...reducersMap, allEntitySearch, workspaceSearch, documents, graph, workspace, user }

  return combineReducers(reducersMap)(state, action);
};

export default coreAppReducer;
