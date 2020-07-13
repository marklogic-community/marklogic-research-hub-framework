import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { bindSelectors } from '../utils/redux-utils';
import { actions, selectors } from '../workspace-redux';

const boundSelectors = bindSelectors(selectors, 'workspace');

const mapStateToProps = (state, ownProps) => {
  return {
    isSelected: boundSelectors.isStagedEntity(state, ownProps.entity.id)
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      stageEntity: actions.stageEntity,
      unstageEntity: actions.unstageEntity
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
);
