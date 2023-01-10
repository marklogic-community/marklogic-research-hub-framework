import { connect } from 'react-redux';

import Workspace from '../components/Workspace';
import { Entity } from 'entity';

import { actions, selectors } from '@marklogic-community/grove-crud-redux';
import { bindSelectors } from '@marklogic-community/grove-core-react-redux-containers';
const boundSelectors = bindSelectors(selectors, 'documents');

const mapStateToProps = (state, ownProps) => {
  const sel = boundSelectors;
  const workspaceDoc = sel.documentById(state, ownProps.id);
  return {
    workspace: workspaceDoc,
    error: sel.errorById(state, ownProps.id),
    contentType: sel.contentTypeById(state, ownProps.id)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    loadWorkspace: id => {
      dispatch(actions.fetchDoc(id, { api: { getDoc: Entity.fetchEntityById } }));
    }
  };
};

const WorkspaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Workspace);
export default WorkspaceContainer;
