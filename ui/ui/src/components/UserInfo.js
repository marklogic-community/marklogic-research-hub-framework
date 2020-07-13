import React from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const UserInfo = ({
  isAuthenticated,
  currentUsername,
  submitLogout,
  loginPath
}) => (
  <div>
    {isAuthenticated ? (
      <div className="pull-right">
        <Nav>
          <NavItem
            onClick={e => {
              e.preventDefault();
              submitLogout(currentUsername);
            }}
            className="user-icon-button"
          >
            <i className="fas fa-user-circle" />
          </NavItem>
        </Nav>
      </div>
    ) : (
      <Nav pullRight>
        <LinkContainer exact to={loginPath || '/login'}>
          <NavItem><i className="fas fa-user-circle" /> Anonymous (Click to Login)</NavItem>
        </LinkContainer>
      </Nav>
    )}
  </div>
);

UserInfo.propTypes = {
  isAuthenticated: PropTypes.bool,
  currentUsername: PropTypes.string,
  submitLogout: PropTypes.func,
  loginPath: PropTypes.string
};

export default UserInfo;
