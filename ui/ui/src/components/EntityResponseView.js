import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Glyphicon } from 'react-bootstrap';
import { Fade } from '@marklogic-community/grove-core-react-components';
import { uniq } from 'lodash';
import { entityConfig } from 'entity';
import SearchResponseView from './SearchResponseView';
import AddToCaseModal from './AddToCaseModal';
import WorkspaceResult from './WorkspaceResult';
import GraphView from './GraphView';

const EntityResponseView = ({
  results,
  uberFacet,
  ...props
}) => {
  const [showAddToCaseModal, setShowAddToCaseModal] = useState(false);
  const [showListOrGraph, setShowListOrGraph] = useState('list');
  const [graphIds, setGraphIds] = useState([]);

  useEffect(
    () => {
      let ids = [];
      if (uberFacet) {
        const entities = results[uberFacet];
        if (entities) {
          entities.forEach(entity => {
            ids.push(entity.uri);
          });
        }
      } else {
        for (let key in results) {
          const entities = results[key];
          entities.forEach(entity => {
            ids.push(entity.uri);
          });
        }
      }
      setGraphIds(uniq(ids.sort()));
    },
    [uberFacet, results]
  );

  const addToCase = () => {
    setShowAddToCaseModal(true);
  };

  const setUberFacet = type => {
    if (type !== uberFacet) {
      props.setUberFacet(type);
    }
  };

  const closeAddToCaseModal = () => setShowAddToCaseModal(false);

  const handlePageSelection = (type) => {
    return (pageNumber) => {
      if (pageNumber !== props.page[type]) {
        props[`change${type}Page`](pageNumber);
      }
    };
  };

  const isShown = type =>
    props.isSearchComplete[type] &&
    !props.isSearchPending[type] &&
    (!uberFacet || uberFacet === type);
  const anySearchComplete = Object.values(props.isSearchComplete).includes(
    true
  );

  let entityNames = Object.keys(entityConfig);
  let isPending = false;
  entityNames.forEach(key => {
    isPending = isPending || props.isSearchPending[key];
  })

  let entityResponses = entityNames.map(entityName => {
    if (isShown(entityName)) {
      return (
        <Fade key={entityName} in={props.isSearchComplete[entityName]} appear={true}>
          <>
            {uberFacet !== entityName && (
              <h4>
                <a
                  onClick={() => setUberFacet(entityName)}
                  name={entityName + "-results"}
                >
                  {entityName}
                </a>
              </h4>
            )}
            <SearchResponseView
              addFilter={props.addFilter}
              selectedEntities={props.selectedEntities}
              error={props.error[entityName]}
              results={results[entityName]}
              executionTime={props.executionTime[entityName]}
              total={props.total[entityName]}
              page={props.page[entityName]}
              totalPages={props.totalPages[entityName]}
              handlePageSelection={handlePageSelection(entityName)}
              entityName={entityName}
              resultComponent={entityConfig[entityName].resultView}
              isSearchPending={props.isSearchPending[entityName]}
              isCurrentUberFacet={uberFacet === entityName}
              setUberFacet={setUberFacet}
              uberFacetType={entityName}
            />
          </>
        </Fade>
      );
    }
    return null;
  });

  return (
    <>
      <Row>
        <Col md={12}>
          <Row>
            <Col md={12}>
              <Button
                bsSize="small"
                title="Add to Case"
                className="tertiary bright-pink-accent-fg pull-left add-to-case-button"
                disabled={props.selectedEntities.length === 0}
                onClick={addToCase}
              >
                <Glyphicon glyph="plus" /> Add to Workspace
              </Button>
              {showListOrGraph === 'list' ? (
                <div>
                  <Button
                    bsSize="small"
                    title="Graph"
                    onClick={() => setShowListOrGraph('graph')}
                    className="secondary red-accent-bd red-accent-fg white-bg pull-right"
                  >
                    <i className="fas fa-project-diagram" />
                    &nbsp;Graph
                  </Button>
                  <Button
                    bsSize="small"
                    title="List"
                    onClick={() => setShowListOrGraph('list')}
                    className="primary red-accent-bg red-accent-bd white-fg  pull-right"
                  >
                    <i className="fas fa-list" />
                    &nbsp;List
                  </Button>
                </div>
              ) : (
                <div>
                  <Button
                    bsSize="small"
                    title="Graph"
                    onClick={() => setShowListOrGraph('graph')}
                    className="primary red-accent-bg red-accent-bd white-fg pull-right"
                  >
                    <i className="fas fa-project-diagram" />
                    &nbsp;Graph
                  </Button>
                  <Button
                    bsSize="small"
                    title="List"
                    onClick={() => setShowListOrGraph('list')}
                    className="secondary red-accent-bd red-accent-fg white-bg pull-right"
                  >
                    <i className="fas fa-list" />
                    &nbsp;List
                  </Button>
                </div>
              )}
            </Col>
          </Row>

          {showListOrGraph === 'list' ? (
            anySearchComplete &&
            !isPending && (
              <div className="entity-response-view">
                <div>
                  {entityResponses}
                  {isShown('workspace') && (
                    <Fade in={props.isSearchComplete.workspace} appear={true}>
                      <>
                        <h4>
                          <a name="workspace-results">
                            Workspaces
                          </a>
                        </h4>
                        <SearchResponseView
                          addFilter={props.addFilter}
                          selectedEntities={props.selectedEntities}
                          error={props.error.workspace}
                          results={results.workspace}
                          executionTime={props.executionTime.workspace}
                          total={props.total.workspace}
                          page={props.page.workspace}
                          totalPages={props.totalPages.workspace}
                          handlePageSelection={handlePageSelection('workspace')}
                          entityName={'workspace'}
                          resultComponent={WorkspaceResult}
                          isSearchPending={props.isSearchPending.workspace}
                          isCurrentUberFacet={uberFacet === 'workspace'}
                          setUberFacet={setUberFacet}
                          uberFacetType="workspace"
                        />
                      </>
                    </Fade>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="panel panel-default">
              <div className="panel-body">
                <GraphView ids={graphIds} />
              </div>
            </div>
          )}
        </Col>
      </Row>
      <AddToCaseModal
        availableWorkspaces={props.availableWorkspaces}
        setAvailableWorkspaces={props.setAvailableWorkspaces}
        selectedWorkspace={props.selectedWorkspace}
        setSelectedWorkspace={props.setSelectedWorkspace}
        show={showAddToCaseModal}
        close={closeAddToCaseModal}
        selectedEntities={props.selectedEntities}
        unstageAllEntities={props.unstageAllEntities}
      />
    </>
  );
};

export default EntityResponseView;
