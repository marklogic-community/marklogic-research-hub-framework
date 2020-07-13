import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { entityConfig } from 'entity';
import SearchView from 'components/SearchView';
import { Entity } from 'entity';
import {
  createActions,
  selectors
} from '@marklogic-community/grove-search-redux';
import { bindSelectors } from '../utils/redux-utils';

const allActions = createActions({ namespace: 'allEntitySearch' });
const allEntitySelectors = bindSelectors(selectors, 'allEntitySearch');

const actions = {
  workspace: createActions({ namespace: 'workspaceSearch' })
};

const entitySelectors = {
  workspace: bindSelectors(selectors, 'workspaceSearch')
};

Object.keys(entityConfig).forEach(key => {
  let ns = `${key}Search`
  actions[key] = createActions({ namespace: ns });
  entitySelectors[key] = bindSelectors(selectors, ns);
});

let EntitySearchContainer = class EntitySearchContainer extends Component {
  render() {
    return <SearchView {...this.props} detailPath="/detail/" />;
  }
};

const mapStateToProps = (state, ownProps) => {
  const facets = {
    workspace: entitySelectors.workspace.searchFacets(state)
  };
  const activeFilters = {
    workspace: entitySelectors.workspace.stagedFilters(state)
  };
  const results = {
    workspace: entitySelectors.workspace.getSearchResults(state)
  };
  const executionTime = {
    workspace: entitySelectors.workspace.getSearchExecutionTime(state)
  };
  const total = {
    workspace: entitySelectors.workspace.getSearchTotal(state)
  };
  const totalPages = {
    workspace: entitySelectors.workspace.getSearchTotalPages(state)
  };
  const page = {
    workspace: entitySelectors.workspace.getPage(state)
  };
  const isSearchPending = {
    workspace: entitySelectors.workspace.isSearchPending(state)
  };
  const isSearchComplete = {
    workspace: entitySelectors.workspace.isSearchComplete(state)
  };
  const error = {
    workspace: entitySelectors.workspace.getSearchError(state)
  };

  Object.keys(entityConfig).forEach(key => {
    if (entitySelectors && entitySelectors[key]) {
      facets[key] = entitySelectors[key].searchFacets(state);
      activeFilters[key] = entitySelectors[key].stagedFilters(state);
      results[key] = entitySelectors[key].getSearchResults(state);
      executionTime[key] = entitySelectors[key].getSearchExecutionTime(state);
      total[key] = entitySelectors[key].getSearchTotal(state);
      totalPages[key] = entitySelectors[key].getSearchTotalPages(state);
      page[key] = entitySelectors[key].getPage(state);
      isSearchPending[key] = entitySelectors[key].isSearchPending(state);
      isSearchComplete[key] = entitySelectors[key].isSearchComplete(state);
      error[key] = entitySelectors[key].getSearchError(state);
    }
  })
  // TODO: shorten method names by removing 'get' and 'Search'?
  return {
    // TODO: get visible queryText from the stagedSearch?
    queryText: allEntitySelectors.getVisibleQueryText(state),
    stagedSearch: uberFacet => {
      let stagedSearch;
      if (entitySelectors[uberFacet]) {
        stagedSearch = entitySelectors[uberFacet].getStagedQuery(state);
        stagedSearch.pageLength = 10;
      }
      else {
        stagedSearch = allEntitySelectors.getStagedQuery(state);
        stagedSearch.pageLength = 4;
      }
      return stagedSearch;
    },
    facets: facets,
    activeFilters: activeFilters,
    results: results,
    executionTime: executionTime,
    total: total,
    totalPages: totalPages,
    page: page,
    isSearchPending: isSearchPending,
    isSearchComplete: isSearchComplete,
    error: error
  };
};

const workspaceAPI = {
  search: searchQuery => {
    return fetch(
      new URL('/api/search/workspace', document.baseURI).toString(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...searchQuery,
          queryText: undefined,
          filters: {
            and: [
              {
                type: 'queryText',
                value: searchQuery.queryText
              },
              ...(searchQuery.filters || [])
            ]
          },
          options: {
            ...searchQuery.options
          }
        })
      }
    ).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      return response.json().then(res => {
        res.results.forEach(result => {
          if (result.content && result.content.entity) {
            result.workspace = result.content.entity;
            result.label = result.workspace.name;
          }
        });
        return res;
      });
    });
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  let pagination = {
    clearFilter: allActions.clearFilter
  };
  Object.keys(entityConfig).forEach(key => {
    pagination[`change${key}Page`] = actions[key].changePage
  });
  return {
    // TODO: I'm now thinking we probably should just have different
    // actions for each entity type
    // And maybe we should have a different container for each
    // entity type
    runSearch: (query, uberFacet) => {
      if (uberFacet) {
        if (actions[uberFacet]) {
          if (entityConfig[uberFacet]) {
            dispatch(actions[uberFacet].runSearch(query, { api: Entity.searchFunc(uberFacet) }));
          }
          else {
            dispatch(actions[uberFacet].runSearch(query, { api: workspaceAPI }));
          }
        }
      } else {
        for (let key in actions) {
          if (entityConfig[key]) {
            dispatch(actions[key].runSearch(query, { api: Entity.searchFunc(key) }));
          }
          else {
            dispatch(actions[key].runSearch(query, { api: workspaceAPI }));
          }
        }
      }
    },
    addFilter: (uberFacet, ...args) => {
      if (actions[uberFacet]) {
        dispatch(actions[uberFacet].addFilter(...args));
      }
      else {
        dispatch(allActions.addFilter(...args));
      }
    },
    removeFilter: (uberFacet, ...args) => {
      if (actions[uberFacet]) {
        dispatch(actions[uberFacet].removeFilter(...args));
      }
      else {
        dispatch(allActions.removeFilter(...args));
      }
    },
    replaceFilter: (uberFacet, ...args) => {
      if (actions[uberFacet]) {
        dispatch(actions[uberFacet].replaceFilter(...args));
      }
      else {
        dispatch(allActions.replaceFilter(...args));
      }
    },
    handleQueryTextChange: queryText => {
      dispatch(allActions.setQueryText(queryText));
      for (let key in actions) {
        dispatch(actions[key].setQueryText(queryText));
      }
    },
    ...bindActionCreators(pagination, dispatch)
  };
};

EntitySearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EntitySearchContainer);

export default EntitySearchContainer;
