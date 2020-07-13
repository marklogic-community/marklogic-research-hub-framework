import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  actions as userActions,
  selectors as userSelectors
} from '../modified-grove-user-redux';

import { bindSelectors } from '../utils/redux-utils';

const boundUserSelectors = bindSelectors(userSelectors, 'user');
class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    // Move fetch() to global so errors, presently just 401s, can be intercepted
    const fetch = global.fetch;
    global.fetch = function(url, options) {
      return fetch(url, options).then(response => {
        if (response.status === 401) {
          props.getAuthenticationStatus();
        }
        return response;
      });
    };
  }

  componentDidMount() {
    if (!this.props.currentUser) {
      this.props.getAuthenticationStatus();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isAuthenticated && !this.props.isAuthenticated) {
      this.props.localLogout();
    }
  }

  render() {
    return this.props.render(this.props);
  }
}

AppContainer.propTypes = {
  // currentUser: PropTypes.object,
  // isAuthenticated: PropTypes.bool.isRequired,
  getAuthenticationStatus: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired,
  submitLogout: PropTypes.func.isRequired,
  localLogout: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    isAuthenticated: boundUserSelectors.isCurrentUserAuthenticated(state),

    currentUser: boundUserSelectors.currentUser(state),
    ...ownProps
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      submitLogout: userActions.submitLogout,
      localLogout: userActions.localLogout,
      getAuthenticationStatus: userActions.getAuthenticationStatus
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer);
