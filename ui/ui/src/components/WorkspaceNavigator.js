import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { actions, selectors } from '../workspace-redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class CustomToggle extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    if (this.props.onClick) this.props.onClick(e);
  }

  render() {
    return (
      <span href="" onClick={this.handleClick} style={{ cursor: 'pointer' }}>
        {this.props.children}
      </span>
    );
  }
}

class WorkspaceNavigator extends React.Component {
  componentWillMount() {
    this.props.fetchAvailableWorkspaces();
  }

  componentDidUpdate() {
    if (this.props.availableWorkspaces.length && !this.props.activeWorkspace) {
      this.props.activateWorkspace(this.props.availableWorkspaces[0].id);
    }
  }

  render() {
    const activeWorkspace = this.props.activeWorkspace;
    const availableWorkspaces = this.props.availableWorkspaces;
    return (
      <section className="workspace-navigator">
        <h2>
          <Dropdown id="workspace-selector">
            <CustomToggle bsRole="toggle">
              <i className="fa fa-briefcase" />{' '}
              <i className="fa fa-caret-down fa-xs" />
            </CustomToggle>
            &nbsp;
            {activeWorkspace && (
              <Link
                to={{
                  pathname: '/workspace',
                  state: { id: activeWorkspace.id },
                  search: `?id=${activeWorkspace.id}`
                }}
                style={{ textDecoration: 'none' }}
                className="hover-link"
              >
                {activeWorkspace.name}
              </Link>
            )}
            <Dropdown.Menu>
              {availableWorkspaces.map(workspace => (
                <MenuItem
                  key={workspace.id}
                  eventKey={workspace.id}
                  onSelect={() => this.props.activateWorkspace(workspace.id)}
                >
                  {workspace.name}
                </MenuItem>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </h2>
      </section>
    );
  }
}

export default connect(
  state => ({
    activeWorkspace: selectors.activeWorkspace(state),
    availableWorkspaces: selectors.availableWorkspaces(state)
  }),
  dispatch =>
    bindActionCreators(
      {
        activateWorkspace: actions.activateWorkspace,
        fetchAvailableWorkspaces: actions.fetchAvailableWorkspaces
      },
      dispatch
    )
)(WorkspaceNavigator);
