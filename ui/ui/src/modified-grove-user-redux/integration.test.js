/* eslint-env jest */
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import nock from 'nock';

import reducer, { actions, selectors } from './';

describe('grove-user-redux', () => {
  let store;
  beforeEach(() => {
    store = createStore(reducer, applyMiddleware(thunk));
  });
  afterEach(nock.cleanAll);

  const user = { username: 'grove-user' };

  it('has initial state', () => {
    expect(selectors.currentUser(store.getState())).toBeUndefined();
    expect(selectors.isCurrentUserAuthenticated(store.getState())).toBeFalsy();
    expect(
      selectors.isAuthenticated(store.getState(), 'grove-user')
    ).toBeFalsy();
  });

  // TODO: create a simple login to mirror simple logout
  // TODO: the current completeLogin is more like completeNetworkLogin
  // TODO: might also have a completeNetworkLogout,
  // for situations where we get a push fromt he auth system
  it('can complete simple login', () => {
    store.dispatch(actions.completeLogin(user));
    expect(
      selectors.isAuthenticated(store.getState(), 'grove-user')
    ).toBeTruthy();
  });

  it('can set current user', () => {
    store.dispatch(actions.setCurrentUser('grove-user'));
    expect(selectors.currentUser(store.getState())).toEqual('grove-user');
  });

  // TODO: handle errors
  it('can request login and launch async authorization', done => {
    nock('http://localhost')
      .post(/login/)
      .reply(200);
    // TODO: test authorization pending
    store.dispatch(actions.submitLogin('grove-user', 'password')).then(() => {
      try {
        expect(
          selectors.isAuthenticated(store.getState(), 'grove-user')
        ).toBeTruthy();
        expect(
          selectors.isCurrentUserAuthenticated(store.getState())
        ).toBeTruthy();
        done();
      } catch (error) {
        done.fail(error);
      }
    });
  });

  it('does local log out', () => {
    store.dispatch(actions.setCurrentUser('grove-user'));
    store.dispatch(actions.completeLogin(user));
    store.dispatch(actions.localLogout('grove-user'));
    expect(selectors.currentUser(store.getState())).toBeUndefined();
    expect(selectors.isCurrentUserAuthenticated(store.getState())).toBeFalsy();
  });

  // TODO: handle errors
  it('does network logout', done => {
    nock('http://localhost')
      .post(/logout/)
      .reply(200);
    store.dispatch(actions.setCurrentUser('grove-user'));
    store.dispatch(actions.completeLogin(user));
    // TODO: pending state
    store.dispatch(actions.submitLogout('grove-user')).then(() => {
      try {
        expect(
          selectors.isAuthenticated(store.getState(), 'grove-user')
        ).toBeFalsy();
        expect(selectors.currentUser(store.getState())).toBeUndefined();
        expect(
          selectors.isCurrentUserAuthenticated(store.getState())
        ).toBeFalsy();
        done();
      } catch (error) {
        done.fail(error);
      }
    });
  });

  it('gets authentication status over the network', done => {
    nock('http://localhost')
      .get(/status/)
      .reply(200, {
        authenticated: true,
        username: 'grove-user'
      });
    store
      .dispatch(actions.getAuthenticationStatus())
      .then(() => {
        try {
          expect(selectors.currentUser(store.getState())).toEqual('grove-user');
          expect(
            selectors.isAuthenticated(store.getState(), 'grove-user')
          ).toBeTruthy();
          expect(
            selectors.isCurrentUserAuthenticated(store.getState())
          ).toBeTruthy();
        } catch (error) {
          done.fail(error);
        }
      })
      .then(() => {
        // user no longer authenticated
        nock('http://localhost')
          .get(/status/)
          .reply(200, {
            authenticated: false
          });
        return store.dispatch(actions.getAuthenticationStatus());
      })
      .then(() => {
        try {
          expect(selectors.currentUser(store.getState())).toBeUndefined();
          expect(
            selectors.isAuthenticated(store.getState(), 'grove-user')
          ).toBeFalsy();
          expect(
            selectors.isCurrentUserAuthenticated(store.getState())
          ).toBeFalsy();
          done();
        } catch (error) {
          done.fail(error);
        }
      });
  });
});
