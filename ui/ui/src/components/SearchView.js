import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './SearchView.css';

import WorkspaceNavigator from './WorkspaceNavigator';
import SearchBar from './SearchBar';
import Facets from './Facets';
import EntityResponseView from './EntityResponseView';
import WaitSpinner from './WaitSpinner';
import { UberFacets } from './UberFacets';
import EntitiesWorkspaceConnector from 'containers/EntitiesWorkspaceConnector';
import { selectors } from 'workspace-redux';
import { entityConfig } from 'entity';

class SearchView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uberFacet: null,
      workspaceRelevanceQuery: true
    };
    this.handleQueryTextChange = this.handleQueryTextChange.bind(this);
    this.search = this.search.bind(this);
    this.setUberFacet = this.setUberFacet.bind(this);
    this.setWorkspaceRelevanceQuery = this.setWorkspaceRelevanceQuery.bind(
      this
    );
    this.fetching = {};
  }

  // TODO: probably should pull out the value within the SearchBar
  handleQueryTextChange(value) {
    this.props.handleQueryTextChange(value);
  }

  onWorkspaceRelevanceToggle(value) {
    this.setWorkspaceRelevanceQuery(value);
  }

  filtersHaveChanged(prevFilters = [], currentFilters = []) {
    return (
      prevFilters !== currentFilters ||
      prevFilters.length !== currentFilters.length ||
      currentFilters.some(
        (filter, index) =>
          prevFilters[index].constraint !== filter.constraint ||
          prevFilters[index].value !== filter.value ||
          prevFilters[index].value.length !== filter.value.length
      )
    );
  }

  componentDidUpdate(prevProps) {
    const stagedSearch = this.props.stagedSearch(this.state.uberFacet);
    const prevStagedSearch = prevProps.stagedSearch(this.state.uberFacet);
    if (
      this.filtersHaveChanged(prevStagedSearch.filters, stagedSearch.filters) ||
      prevProps.activeWorkspace !== this.props.activeWorkspace
    ) {
      this.search(this.state.uberFacet);
    }
    if (prevStagedSearch.page !== stagedSearch.page) {
      // TODO: DRY up with this.search()?
      const query = { ...stagedSearch };
      if (this.props.activeWorkspace) {
        query.workspace = this.props.activeWorkspace.id;
      }
      this.props.runSearch(query, this.state.uberFacet);
    }
  }

  setUberFacet(uberFacet) {
    this.setState({ uberFacet: uberFacet });
    // have to pass in uberFacet as the state does not update in time
    this.search(uberFacet);
  }

  setWorkspaceRelevanceQuery(value) {
    this.setState({ workspaceRelevanceQuery: value });
  }

  search(uberFacet) {
    if (this.props.stagedSearch(uberFacet).page === 1) {
      const query = { ...this.props.stagedSearch(uberFacet) };
      if (this.props.activeWorkspace) {
        query.workspace = this.props.activeWorkspace.id;
      }
      query.workspaceRelevanceQuery = this.state.workspaceRelevanceQuery;
      this.props.runSearch(query, uberFacet);
    } else if (this.props.changePage) {
      this.props.changePage(1);
    }
  }

  render() {
    const showSidebar = Object.values(this.props.isSearchComplete).includes(
      true
    );
    const uberFacet = this.state.uberFacet;
    const uberFacetTitle =
      !uberFacet || typeof uberFacet !== 'string'
        ? null
        : uberFacet.substring(0, 1).toUpperCase() +
          uberFacet.substring(1, uberFacet.length - 1) +
          ' Filters';

    const sections = Object.keys(entityConfig).map(key => {
      if (this.props.isSearchComplete[key]) {
        return (
          <li key={key}>
            <a href = {"#" + key + "-results"}>{entityConfig[key].plural}</a>
          </li>
        );
      }
    });

    const isSearching = Object.values(this.props.isSearchPending).reduce((output, input) => {
      return output || input;
    }, false);

    return (
      <div className="search-view">
        <aside className="sidebar">
          <WorkspaceNavigator />
          {showSidebar && (
            <>
              {uberFacet ? (
                <div className="facets">
                  <h4>{uberFacetTitle}</h4>
                  <hr />
                  <Facets
                    availableFilters={this.props.facets[uberFacet]}
                    activeFilters={this.props.activeFilters[uberFacet]}
                    addFilter={this.props.addFilter.bind(null, uberFacet)}
                    removeFilter={this.props.removeFilter.bind(null, uberFacet)}
                    replaceFilter={this.props.replaceFilter.bind(
                      null,
                      uberFacet
                    )}
                    selectedEntities={this.props.selectedEntities}
                    uberFacet={uberFacet}
                  />
                </div>
              ) : (
                <div className="sections">
                  <h4>Sections</h4>
                  <hr />
                  <ul style={{ paddingLeft: '15px' }}>
                    {sections}

                  </ul>
                </div>
              )}
            </>
          )}
        </aside>
        <section className="search-container">
          <header>
            <SearchBar
              queryText={this.props.queryText}
              onQueryTextChange={this.handleQueryTextChange}
              onSearchExecute={() => this.search(uberFacet)}
              workspaceRelevanceQuery={this.state.workspaceRelevanceQuery}
              onWorkspaceRelevanceToggle={value =>
                this.onWorkspaceRelevanceToggle(value)
              }
            />
            <UberFacets
              setUberFacet={this.setUberFacet}
              uberFacet={uberFacet}
            />
          </header>
          <div className="search-response">
            <WaitSpinner show={isSearching} />
            <EntityResponseView
              {...this.props}
              availableWorkspaces={this.state.availableWorkspaces}
              setAvailableWorkspaces={this.setAvailableWorkspaces}
              selectedWorkspace={this.state.selectedWorkspace}
              setSelectedWorkspace={this.setSelectedWorkspace}
              uberFacet={uberFacet}
              setUberFacet={this.setUberFacet}
              selectedEntities={this.props.selectedEntities}
            />
          </div>
        </section>
      </div>
    );
  }
}

export default EntitiesWorkspaceConnector(
  connect(state => ({
    activeWorkspace: selectors.activeWorkspace(state)
  }))(SearchView)
);
