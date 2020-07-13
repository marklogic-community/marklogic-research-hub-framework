import React, { useState } from 'react';
import { Row, Col, Modal, Button, Glyphicon } from 'react-bootstrap';
import { actions, selectors } from '../workspace-redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import EntitiesWorkspaceConnector from 'containers/EntitiesWorkspaceConnector';
import { entityConfig } from 'entity';

require('isomorphic-fetch');

const defaultRequestOptions = {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'same-origin'
};

async function addToNew(workspace) {
  return fetch(
    new URL('/v1/resources/workspaces', document.baseURI).toString(),
    {
      ...defaultRequestOptions,
      body: JSON.stringify(workspace)
    }
  );
}

async function addToExisting(entities, workspace) {
  const response = await fetch(
    new URL(
      `/v1/resources/workspaceDetails?rs:id=${workspace.id}&rs:action=entity`,
      document.baseURI
    ).toString(),
    {
      ...defaultRequestOptions,
      body: JSON.stringify({
        entities: entities.map(entity => {
          return {
            predicate: entity.predicate,
            value: entity.weight,
            entity: entity.uri
          };
        })
      })
    }
  );
  const responseJson = await response.json();
  if (!response.ok) {
    throw new Error(responseJson.message);
  }
  return responseJson;
}

const predicatesFor = entity => {
  const predicateConfig = {}
  Object.keys(entityConfig).map(key => {
    if (entityConfig && entityConfig[key] && entityConfig[key].class && entityConfig[key].class.getWorkspacePredicates) {
      predicateConfig[key] = entityConfig[key].class.getWorkspacePredicates();
    }
  })
  return predicateConfig[entity.type] || ['isRelevant'];
};

const AddToCaseModal = ({
  availableWorkspaces,
  fetchAvailableWorkspaces,
  activeWorkspace,
  activateWorkspace,
  show,
  close,
  selectedEntities,
  unstageAllEntities
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newOrExisting, setNewOrExisting] = useState('existing');
  const [entitiesWithPredicates, setEntitiesWithPredicates] = useState([]);
  //if (selectedEntities) {
  React.useEffect(
    () => {
      setEntitiesWithPredicates(
        selectedEntities.map(e => ({
          ...e,
          predicate: predicatesFor(e)[0],
          weight: 'Definite'
        }))
      );
    },
    [selectedEntities]
  );
  //}

  const selectWorkspace = event => {
    activateWorkspace(event.target.value);
  };

  const handleNewWorkspaceName = event =>
    setNewWorkspaceName(event.target.value);

  const handleSetNewOrExisting = event => setNewOrExisting(event.target.value);

  // const WorkspaceConfig = () => {
  //   useEffect(() => {
  //     const fetchWorkspaceConfig = async () => {
  //       const response = await fetch(
  //         new URL('/v1/resources/workspaceConfig').toString(),
  //         {
  //           credentials: 'same-origin'
  //         }
  //       );
  //       const responseJson = await response.json();
  //       if (!response.ok) {
  //         throw new Error(responseJson.message);
  //       }
  //     };
  //     fetchWorkspaceConfig().catch(error => {
  //       /* eslint-disable no-console */
  //
  //       /* eslint-enable no-console */
  //     });
  //   }, []);
  // };

  const handleSubmit = event => {
    event.preventDefault();
    if (newOrExisting === 'existing') {
      addToExisting(entitiesWithPredicates, activeWorkspace);
    } else {
      const entities = {};
      entitiesWithPredicates.forEach(entity => {
        entities[entity.uri] = {
          predicates: { [entity.predicate]: entity.weight }
        };
      });
      const workspace = { name: newWorkspaceName, entities: entities };
      addToNew(workspace).then(response => {
        if (response.ok) {
          response.json().then(responseJson => {
            activateWorkspace(responseJson.id);
          });
        } else {
          console.error('Workspace update failed. Please try again.',response.json());
        }
        fetchAvailableWorkspaces();
      });
      setNewOrExisting('existing');
    }
    setNewWorkspaceName('');
    unstageAllEntities(selectedEntities);
    close();
  };

  const icons = new Map(
    Object.keys(entityConfig).map(key => {
      const config = entityConfig[key].class
      // working around a strange react bug
      // where this crashes if the right click visjs modal is up
      // and you run a search
      // twas faster to put in the conditional than to figure out the true problem
      // which likely lives down in the react weeds
      if (config && config.getIcon) {
        return [key, config.getIcon()];
      }
      return null
    }).filter(x => x !== null).concat([['workspace', 'fas fa-briefcase uf-icon']])
  );

  return (
    <Modal show={show} onHide={close}>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <Row>
            <div className="form-group col-md-8">
              <div style={{ display: 'flex' }}>
                <div className="col-md-6">
                  <div className="radio radio-primary">
                    <label>
                      <input
                        type="radio"
                        name="newOrExistingCase"
                        id="existingCaseRadio"
                        checked={newOrExisting === 'existing'}
                        onChange={handleSetNewOrExisting}
                        value="existing"
                      />
                      Add to Existing
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <select
                    value={activeWorkspace ? activeWorkspace.id : ''}
                    onChange={selectWorkspace}
                    className="form-control"
                    onFocus={() => setNewOrExisting('existing')}
                  >
                    {availableWorkspaces.map(workspace => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div className="col-md-6">
                  <div className="radio radio-primary">
                    <label>
                      <input
                        type="radio"
                        name="newOrExistingCase"
                        id="newCaseRadio"
                        checked={newOrExisting === 'new'}
                        onChange={handleSetNewOrExisting}
                        value="new"
                      />
                      Create New
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    value={newWorkspaceName}
                    onChange={handleNewWorkspaceName}
                    onFocus={() => setNewOrExisting('new')}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-4 input-group">
              <Button
                type="submit"
                bsSize="small"
                className="primary bright-purple-accent-bg bright-purple-accent-bd white-fg"
                disabled={
                  (newOrExisting === 'existing' && !activeWorkspace) ||
                  (newOrExisting === 'new' && !newWorkspaceName)
                }
              >
                Submit
              </Button>
              &nbsp;
              <Button
                bsSize="small"
                className="tertiary critical-light-fg white-bd"
                onClick={close}
              >
                <Glyphicon glyph="remove" />
                &nbsp;Cancel
              </Button>
            </div>
          </Row>
          <Row>
            <Col md={12}>
              {entitiesWithPredicates.map(entity => (
                <div key={entity.id}>
                  <Row>
                    <Col md={12}>
                      <Col xs={12} sm={6}>
                        <h3>
                          <i className={icons.get(entity.type)} />
                          &nbsp;
                          {entity.label}
                        </h3>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="">
                          <select
                            className="form-control"
                            value={entity.predicate}
                            onChange={event => {
                              const newEntities = entitiesWithPredicates.map(
                                e => {
                                  if (e.id === entity.id) {
                                    return {
                                      ...e,
                                      predicate: event.target.value
                                    };
                                  } else {
                                    return e;
                                  }
                                }
                              );
                              setEntitiesWithPredicates(newEntities);
                            }}
                          >
                            {predicatesFor(entity).map(predicate => (
                              <option key={predicate} value={predicate}>
                                {predicate}
                              </option>
                            ))}
                          </select>
                          <select
                            className="form-control"
                            value={entity.weight}
                            onChange={event => {
                              const newEntities = entitiesWithPredicates.map(
                                e => {
                                  if (e.id === entity.id) {
                                    return {
                                      ...e,
                                      weight: event.target.value
                                    };
                                  } else {
                                    return e;
                                  }
                                }
                              );
                              setEntitiesWithPredicates(newEntities);
                            }}
                          >
                            <option value="definite">Definite</option>
                            <option value="likely">Likely</option>
                            <option value="not">Not</option>
                          </select>
                        </div>
                      </Col>
                    </Col>
                  </Row>
                  <hr />
                </div>
              ))}
            </Col>
          </Row>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EntitiesWorkspaceConnector(
  connect(
    state => ({
      activeWorkspace: selectors.activeWorkspace(state),
      availableWorkspaces: selectors.availableWorkspaces(state)
    }),
    dispatch =>
      bindActionCreators(
        {
          fetchAvailableWorkspaces: actions.fetchAvailableWorkspaces,
          activateWorkspace: actions.activateWorkspace
        },
        dispatch
      )
  )(AddToCaseModal)
);
