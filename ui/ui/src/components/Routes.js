import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import queryString from 'query-string';

import { DetailContainer } from 'grove-core-react-redux-containers';

import LoginContainer from 'containers/LoginContainer';

import EntitySearchContainer from 'containers/EntitySearchContainer';

import EntityDetailContainerFactory from 'containers/EntityDetailContainer';

import WorkspaceDetailContainer from 'containers/WorkspaceDetailContainer';

import { entityConfig } from 'entity'

// allow an env var to determine if users can anonymously access
// the UI
const allowAnonymousAuth = process.env.REACT_APP_ALLOW_ANONYMOUS_USERS === 'true';

const PrivateRoute = ({
  component: Component,
  render,
  isAuthenticated,
  isAuthStatusPending,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={props =>
        (allowAnonymousAuth || isAuthenticated) ? (
          render ? (
            render(props)
          ) : (
            <Component {...props} />
          )
        ) : isAuthStatusPending ? (
          <></>
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};


function buildPrivateRouteList(isAuthenticated,isAuthStatusPending) {

  const privateRouteList = [];

  Object.keys(entityConfig).forEach(key => {
    let config = entityConfig[key];

    let EntityDetailContainer = EntityDetailContainerFactory(key);

    privateRouteList.push(
      <PrivateRoute
        isAuthenticated={isAuthenticated}
        isAuthStatusPending={isAuthStatusPending}
        exact
        key={config.route}
        path={config.route}
        render={props => {
          // Prefer to get id from the state
          const id =
            (props.location.state && props.location.state.id) ||
            queryString.parse(props.location.search).id;
          return <EntityDetailContainer id={id} type={key} />;
        }}
      />)
  })

  return privateRouteList;
}

const Routes = ({ isAuthenticated, isAuthStatusPending }, ...rest) => {
  return (
    <Switch>
      <Route
        exact
        path="/login"
        render={props => {
          return isAuthenticated ? (
            <Redirect
              to={(props.location.state && props.location.state.from) || '/'}
            />
          ) : (
            <LoginContainer />
          );
        }}
      />
      <PrivateRoute
        isAuthenticated={isAuthenticated}
        isAuthStatusPending={isAuthStatusPending}
        exact
        path="/"
        render={() => <EntitySearchContainer />}
      />
      <PrivateRoute
        isAuthenticated={isAuthenticated}
        isAuthStatusPending={isAuthStatusPending}
        exact
        key="/workspace"
        path="/workspace"
        render={props => {
          // Prefer to get id from the state
          const id =
            (props.location.state && props.location.state.id) ||
            queryString.parse(props.location.search).id;
          return <WorkspaceDetailContainer id={id} />;
        }}
      />
      <PrivateRoute
        isAuthenticated={isAuthenticated}
        isAuthStatusPending={isAuthStatusPending}
        exact
        path="/detail"
        render={props => {
          // Prefer to get id from the state
          const id =
            (props.location.state && props.location.state.id) ||
            queryString.parse(props.location.search).id;
          return <DetailContainer id={id} />;
        }}
      />
      { buildPrivateRouteList(isAuthenticated,isAuthStatusPending) }
    </Switch>
  );
};

export default Routes;
