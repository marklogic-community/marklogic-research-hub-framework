import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actions, selectors } from '@marklogic-community/grove-crud-redux';
import { bindSelectors } from '../utils/redux-utils';
import { getGraphData } from '../graph-redux/actions';
import { selectors as graphSelectors } from '../graph-redux/reducer';
import { Entity, entityConfig } from 'entity';

const boundSelectors = bindSelectors(selectors, 'documents');
const graphBoundSelectors = bindSelectors(graphSelectors, 'graph');

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

const mapDispatchToProps = dispatch => {
  return {
    loadDetail: id => {
      dispatch(actions.fetchDoc(id, { api: { getDoc: Entity.fetchEntityById } }));
    },
    ...bindActionCreators(
      {
        loadGraph: getGraphData
      },
      dispatch
    )
  };
};

const EntityDetailContainerFactory = (type) => {
    const Component = entityConfig[type].detailView;

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(Component);
}

export default EntityDetailContainerFactory;
