import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { YesNo } from './ModalDialogs';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import $ from 'jquery';
import GraphView from './GraphView';
import './WorkspaceDetailView.css';

import { actions, selectors } from '../workspace-redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EntityContainer from '../containers/EntityContainer';

import WorkspaceContainer from '../containers/WorkspaceContainer';
import WorkspaceNavigator from './WorkspaceNavigator';

// group entities by type and map to an array instead of hash for easier rendering
const mapEntities = entities => {
  const mapped = {};
  if (entities) {
    Object.keys(entities).forEach(uri => {
      const entity = entities[uri];
      const type = entity.type;
      if (!mapped[type]) {
        mapped[type] = [];
      }
      mapped[type].push({ uri: uri, ...entity });
    });
  }
  return mapped;
};

class WorkspaceDetailView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entities: mapEntities(props.activeEntities),
      graphIds: [],
      editDesc: false,
      view: 'detail'
    };

    this.renderEntity = this.renderEntity.bind(this);
    this.removeEntity = this.removeEntity.bind(this);
    this.removeWorkspaceEntity  = this.removeWorkspaceEntity.bind(this);
    this.beginEditDesc = this.beginEditDesc.bind(this);
    this.doneEditDesc = this.doneEditDesc.bind(this);
    this.showView = this.showView.bind(this);
  }

  showView(name) {
    this.setState({ view: name });
  }

  beginEditDesc() {
    this.setState({ editDesc: true });
  }

  doneEditDesc(value) {
    if (value && value !== this.props.activeWorkspace.description) {
      // if there's a value change, send it to server
      fetch(
        new URL(
          '/v1/resources/workspaceDetails?rs:id=' +
          this.props.id +
          '&rs:action=description',
          document.baseURI
        ).toString(),
        {
          method: 'PUT',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ description: value })
        }
      );
      // TODO: should we have actions for changing these or just keep it in this details view?
      this.props.activeWorkspace.description = value;
    }
    this.setState({ editDesc: false });
  }

  showYesNoDlg(msg, yesClickFx) {
    this.setState({ msgYesNo: msg, showYesNo: true, yesClick: yesClickFx });
  }

  deleteWorkspace(workspaceId) {
    fetch(
      new URL(
        '/v1/resources/workspaceDetails?rs:id=' + workspaceId,
        document.baseURI
      ).toString(),
      {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(response => {
      this.props.activateWorkspace(null);
      this.props.fetchAvailableWorkspaces();

      this.setState({ toDashboard: true });
    });
  }

  componentWillMount() {
    this.props.activateWorkspace(this.props.id);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      //this.props.activateWorkspace(this.props.id)
    }
    if (prevProps.activeEntities !== this.props.activeEntities) {
      this.setState({
        entities: mapEntities(this.props.activeEntities),
        graphIds: Object.keys(this.props.activeEntities || {})
      });
    }
    this.attachScrollListener();
  }

  attachScrollListener() {
    var sections = $('section.quick-section'),
      nav = $('#controls');

    $(window).on('scroll', function () {
      var cur_pos = $(this).scrollTop();

      sections.each(function () {
        var top = $(this).offset().top,
          bottom = top + $(this).outerHeight();

        if (cur_pos + 65 >= top && cur_pos <= bottom) {
          nav.find('a').removeClass('active');
          sections.removeClass('active');

          $(this).addClass('active');
          nav.find('a[href="#' + $(this).attr('id') + '"]').addClass('active');
        }
      });
    });

    nav.find('a').on('click', function () {
      var $el = $(this),
        id = $el.attr('href');

      var offset = 0;

      if (id !== '#top') {
        let anchor = $(id + '_anchor');
        if (anchor) {
          let off = anchor.offset();
          if (off) {
            offset = off.top;
          }
        }
      }

      $('html, body').animate(
        {
          scrollTop: offset
        },
        500
      );

      return false;
    });
  }

  removeWorkspaceEntity(type, uri) {
    this.doRemoveWorkspaceEntity(type, uri)
  }

  removeEntity(type, uri, name) {
    this.showYesNoDlg(
      'Do you really want to remove the ' +
      type +
      ' ' +
      name +
      ' from the workspace?',
      () => this.doRemoveEntity(type, uri, name)
    );
  }

  doRemoveWorkspaceEntity(type, uri) {
    const newGraphIds = this.state.graphIds.filter(guid => guid !== uri);
    console.log(this.state.entities)
    console.log(type)
    this.setState({
      graphIds: newGraphIds
    });
    fetch(
      new URL(
        '/v1/resources/workspaceDetails?rs:id=' +
        this.props.id +
        '&rs:action=deleteWorkspaceEntity',
        document.baseURI
      ).toString(),
      {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entity: [uri] })
      }
    ).then(response => {
      if (response.ok) {
         uri = decodeURIComponent(uri);
       
        // update state to force a render
        const entities = this.state.entities["publication"].filter(entity => entity.uri !== uri)
        console.log(entities)
        this.setState({
         entities :  mapEntities(entities)
        });

      } else {
        console.warn('error removing entity', response.statusText); // eslint-disable-line no-console
      }
    });
  }

  doRemoveEntity(type, uri, name) {
    const newGraphIds = this.state.graphIds.filter(guid => guid !== uri);
    this.setState({
      graphIds: newGraphIds
    });
    fetch(
      new URL(
        '/v1/resources/workspaceDetails?rs:id=' +
        this.props.id +
        '&rs:action=deleteEntity',
        document.baseURI
      ).toString(),
      {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entity: [uri] })
      }
    ).then(response => {
      if (response.ok) {
        // update state to force a render
        const entities = {
          ...this.state.entities,
          [type]: this.state.entities[type].filter(entity => entity.uri !== uri)
        };
        this.setState({
          entities
        });
      } else {
        console.warn('error removing entity', response.statusText); // eslint-disable-line no-console
      }
    });
  }

  renderEntity(entity) {
    switch (entity.type) {
      case 'workspace':
        return (
          <WorkspaceContainer
            name={entity.preferredName || ' '}
            id={entity.uri}
            removeEntity={this.removeEntity}
          />
        );
      default:
        return (
          <EntityContainer type={entity.type} name={entity.preferredName || ' '} id={entity.uri} removeWorkspaceEntity={this.removeWorkspaceEntity} />
        );
    }
  }

  render() {
    if (this.state.toDashboard === true) {
      return <Redirect to="/" />;
    }

    const workspace = this.props.activeWorkspace;
    return (
      <>
        <YesNo
          msg={this.state.msgYesNo}
          show={this.state.showYesNo}
          onClose={() => this.setState({ showYesNo: false })}
          yes={this.state.yesClick}
        />
        <Row className="detail-header">
          <Col md={6}>
            <WorkspaceNavigator />
          </Col>
          <Col md={6} className="text-right detail-toggle">
            {this.state.view === 'detail' && (
              <button
                className="trigger"
                title="show graph"
                aria-label="show graph"
                onClick={() => this.showView('graph')}
              >
                <i className="fa fa-project-diagram" /> Graph view
              </button>
            )}
            {this.state.view === 'graph' && (
              <button
                className="trigger"
                title="show detail"
                aria-label="show detail"
                onClick={() => this.showView('detail')}
              >
                <i className="fa fa-list" /> Detail view
              </button>
            )}
          </Col>
        </Row>
        <Row className="detail-view">
          <Col md={2}>
            <nav id="controls">
              <ul>
                <li>
                  <a href="#top" className="active">
                    Name
                  </a>
                </li>
                <li>
                  <a href="#description">Description</a>
                </li>
                {Object.keys(this.state.entities).map(key => (
                  <li key={key}>
                    <a href={'#' + key}>{key}s</a>
                  </li>
                ))}
              </ul>
            </nav>
          </Col>
          <Col md={10}>
            <div>
              {this.props.error ? (
                <div id="detail">
                  <p>
                    <strong>
                      There was an error retrieving this publication.
                    </strong>
                  </p>
                  <p>
                    The server sent the following error message:&nbsp;
                    <span className="text-danger">{this.props.error}</span>
                  </p>
                </div>
              ) : (
                  workspace &&
                  (this.state.view === 'detail' ? (
                    <article className="workspace-detail" id="detail">
                      <section id="top" className="quick-section">
                        <a id="top_anchor" name="top" />
                        <h1 className="inline">
                          {workspace.name || this.props.id}
                        </h1>
                        <button
                          className="btn btn-danger btn-header"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.showYesNoDlg(
                              'Do you really want to delete the workspace named ' +
                              workspace.name +
                              '?',
                              () => this.deleteWorkspace(workspace.id)
                            );
                          }}
                        >
                          <i className="glyphicon glyphicon-trash" />
                        </button>
                      </section>

                      <section id="description" className="quick-section">
                        <a id="description_anchor" name="description" />
                        <header>
                          <h4>Description</h4>
                        </header>
                        {!this.state.editDesc && (
                          <h2>
                            {workspace.description}{' '}
                            <button
                              className="trigger"
                              title="edit description"
                              aria-label="edit description"
                              onClick={this.beginEditDesc}
                            >
                              <i className="fas fa-pencil-alt" />
                            </button>
                          </h2>
                        )}
                        {this.state.editDesc && (
                          <form
                            name="edit-description"
                            className="edit-form"
                            onSubmit={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              this.doneEditDesc(this.refs.editDesc.value);
                            }}
                          >
                            <textarea
                              ref="editDesc"
                              rows="4"
                              defaultValue={workspace.description}
                            />
                            <section className="edit-actions">
                              <button
                                className="trigger"
                                aria-label="save changes"
                                type="submit"
                                title="save changes"
                              >
                                <i className="fas fa-check-circle" />
                              </button>
                              <button
                                className="trigger"
                                aria-label="cancel changes"
                                type="reset"
                                title="cancel changes"
                                onClick={e => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  this.doneEditDesc();
                                }}
                              >
                                <i className="fas fa-times-circle" />
                              </button>
                            </section>
                          </form>
                        )}
                      </section>

                      {Object.keys(this.state.entities).map((type, index) => {
                        const entities = this.state.entities[type];
                        if (entities.length) {
                          return (
                            <section
                              id={type}
                              className="quick-section"
                              key={index}
                            >
                              <a id={type + '_anchor'} name={type} />
                              <header>
                                <h4>
                                  {type}s ({entities.length})
                              </h4>
                              </header>
                              <div className="entity-list">
                                {entities.map(entity => (
                                  <article
                                    key={entity.uri}
                                    className="entity-card"
                                    data-entity-predicate={
                                      Object.values(entity.predicates)[0]
                                    }
                                  >
                                    <section className="entity-detail">
                                      {this.renderEntity(entity)}
                                    </section>
                                  </article>
                                ))}
                              </div>
                            </section>
                          );
                        }
                      })}
                    </article>
                  ) : (
                      <section id="graph" className="quick-section">
                        <GraphView ids={this.state.graphIds} />
                      </section>
                    ))
                )}
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

WorkspaceDetailView.propTypes = {
  detail: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  template: PropTypes.func,
  contentType: PropTypes.string,
  error: PropTypes.string
};

export default connect(
  state => ({
    activeWorkspace: selectors.activeWorkspace(state),
    activeEntities: selectors.activeEntities(state)
  }),
  dispatch =>
    bindActionCreators(
      {
        activateWorkspace: actions.activateWorkspace,
        fetchAvailableWorkspaces: actions.fetchAvailableWorkspaces
      },
      dispatch
    )
)(WorkspaceDetailView);
