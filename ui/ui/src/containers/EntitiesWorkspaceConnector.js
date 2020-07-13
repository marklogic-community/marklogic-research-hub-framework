import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { bindSelectors } from '../utils/redux-utils';
import { actions, selectors } from '../workspace-redux';

const boundSelectors = bindSelectors(selectors, 'workspace');

const mapStateToProps = (state, ownProps) => {
  return {
    selectedEntities: boundSelectors.stagedEntities(state)
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      unstageAllEntities: actions.unstageAllEntities
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
