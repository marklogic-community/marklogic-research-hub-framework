/* eslint-env jest */
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducer, { selectors } from './';
import * as actions from './actions';

describe('workspace redux', () => {
  let store;
  beforeEach(() => {
    store = createStore(reducer, applyMiddleware(thunk));
  });

  const entity1 = {
    id: 'entity1-id',
    label: 'Entity 1',
    type: 'coolEntity'
  };
  const entity2 = {
    id: 'entity2-id',
    label: 'Entity 2',
    type: 'coolEntity'
  };

  describe('stagedEntities', () => {
    it('has intelligent defaults', () => {
      expect(selectors.stagedEntities(store.getState())).toEqual([]);
      expect(selectors.isStagedEntity(store.getState(), 'no-such')).toEqual(
        false
      );
    });

    it('adds and removes individual stagedEntities', () => {
      store.dispatch(actions.stageEntity(entity1));
      expect(selectors.stagedEntities(store.getState())).toEqual([entity1]);
      expect(selectors.isStagedEntity(store.getState(), 'entity1-id')).toEqual(
        true
      );
      expect(selectors.isStagedEntity(store.getState(), 'no-such')).toEqual(
        false
      );

      store.dispatch(actions.stageEntity(entity2));
      expect(selectors.stagedEntities(store.getState())).toEqual([
        entity1,
        entity2
      ]);
      expect(selectors.isStagedEntity(store.getState(), 'entity1-id')).toEqual(
        true
      );
      expect(selectors.isStagedEntity(store.getState(), 'entity2-id')).toEqual(
        true
      );
      expect(selectors.isStagedEntity(store.getState(), 'no-such')).toEqual(
        false
      );

      store.dispatch(actions.unstageEntity('entity1-id'));
      expect(selectors.stagedEntities(store.getState())).toEqual([entity2]);
      expect(selectors.isStagedEntity(store.getState(), 'entity1-id')).toEqual(
        false
      );
      expect(selectors.isStagedEntity(store.getState(), 'entity2-id')).toEqual(
        true
      );
      expect(selectors.isStagedEntity(store.getState(), 'no-such')).toEqual(
        false
      );
    });

    it('unstages all entities', () => {
      store.dispatch(actions.stageEntity(entity1));
      store.dispatch(actions.stageEntity(entity2));
      store.dispatch(
        actions.unstageAllEntities(selectors.stagedEntities(store.getState()))
      );
      expect(selectors.stagedEntities(store.getState())).toEqual([]);
    });
  });
});
