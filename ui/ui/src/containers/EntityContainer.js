import { connect } from 'react-redux';

import { Entity } from 'entity';

import EntityComponent from 'components/EntityComponent';

import { actions, selectors } from '@marklogic-community/grove-crud-redux';
import { bindSelectors } from '@marklogic-community/grove-core-react-redux-containers';

const boundSelectors = bindSelectors(selectors, 'documents');

const mapStateToProps = (state, ownProps) => {
  const sel = boundSelectors;
  const entityDoc = sel.documentById(state, ownProps.id);
  return {
    entity: entityDoc,
    error: sel.errorById(state, ownProps.id),
    contentType: sel.contentTypeById(state, ownProps.id)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadEntity: id => {
      // Wrap 'id' in a Promise if not one itself to simplify following code..
      if (!(id instanceof Promise)) {
        id = Promise.resolve(id);
      }
      // Unwrap promises
      return id.then(id => {
        // dispatch backend call
        if (!id) { return null; }
        return (
          dispatch(
            actions.fetchDoc(id, { api: { getDoc: Entity.fetchEntityById } })
          )
          // and return a copy of the entity directly for convenience
          .then(response => {
            let content = response.payload.response.content;
            return content.entity || content;
          })
        );
      });
    }
  };
};

const EntityContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EntityComponent);
export default EntityContainer;
