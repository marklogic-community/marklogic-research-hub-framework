import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import WorkspaceDetailView from '../components/WorkspaceDetailView';

import { actions, selectors } from '@marklogic-community/grove-crud-redux';
import { bindSelectors } from '../utils/redux-utils';
// import { resolve } from 'path';
import { getGraphData } from '../graph-redux/actions';
import { selectors as graphSelectors } from '../graph-redux/reducer';
const boundSelectors = bindSelectors(selectors, 'documents');
const graphBoundSelectors = bindSelectors(graphSelectors, 'graph');

// const defaultRequestOptions = {
//   method: 'GET',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   credentials: 'same-origin'
// };

// const fetchWorkspace = (docId, extraArgs = {}) => {
//   return dispatch => {
//     dispatch({
//       type: 'FETCH_DOC_REQUESTED',
//       payload: { docId }
//     });

//     return fetch(
//       new URL(
//         `/v1/resources/workspaceDetails?rs:id=${docId}`,
//         document.baseURI
//       ).toString(),
//       {
//         ...defaultRequestOptions
//       }
//     ).then(
//       response =>
//         dispatch({
//           type: 'FETCH_DOC_SUCCESS',
//           payload: {
//             response,
//             docId
//           }
//         }),
//       error => {
//         dispatch({
//           type: 'FETCH_DOC_FAILURE',
//           payload: {
//             error: 'Error fetching document: ' + error.message,
//             docId
//           }
//         });
//       }
//     );
//   };
// };

const mapStateToProps = (state, ownProps) => {
  const sel = boundSelectors;
  const detail = sel.documentById(state, ownProps.id);
  return {
    // TODO: move this label implementation to a samplePerson branch
    // because it is not generic, but it is useful for a quick Grove demo
    label: detail && detail.name,
    detail: detail,
    error: sel.errorById(state, ownProps.id),
    contentType: sel.contentTypeById(state, ownProps.id),
    graphData: graphBoundSelectors.graphData(state, ownProps.id)
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadDetail: actions.fetchDoc,
      loadGraph: getGraphData
    },
    dispatch
  );

const WorkspaceDetailContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceDetailView);

export default WorkspaceDetailContainer;
