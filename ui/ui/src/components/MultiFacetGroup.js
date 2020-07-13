import React from 'react';
import { connect } from 'react-redux';

class MultiFacetGroup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: false,
      errors: null,
      values: []
    };

    this.fetchFacetValues = this.fetchFacetValues.bind(this);
    this.changeValue = this.changeValue.bind(this);
    this.getSelectedValues = this.getSelectedValues.bind(this);
  }

  componentWillMount() {
    this.fetchFacetValues();
  }

  componentWillUpdate(prevProps) {
    if (!prevProps.isSearchPending && this.props.isSearchPending) {
      this.fetchFacetValues();
    }
  }

  getSelectedValues() {
    const constraint = this.props.activeFilters.filter(item => {
      return item.constraint === this.props.facetName;
    });
    return constraint.length ? constraint[0].value : [];
  }

  changeValue(facet) {
    const values = this.getSelectedValues();
    const ind = values.indexOf(facet.value);
    if (ind > -1) {
      // remove it if currently selected
      values.splice(ind, 1);
    } else {
      values.push(facet.value);
    }
    if (values.length) {
      this.props.replaceFilter(values, { boolean: 'or' });
    } else {
      this.props.removeFilter(facet.value, { boolean: 'or' });
    }
  }

  fetchFacetValues() {
    //this.setState({ fetching: true });
    // modify the fiters so our current group is excluded
    const filters = this.props.stagedSearch.filters.filter(
      facet => facet.constraint !== this.props.facetName
    );
    const url = new URL(
      '/api/search/' + this.props.searchContext + '/facets',
      document.baseURI
    ).toString();
    this.fetching = fetch(url, {
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify({
        queryText: undefined,
        filters: {
          and: [
            {
              type: 'queryText',
              value: this.props.stagedSearch.queryText
            },
            ...filters
          ]
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(json_response => {
        const facets = json_response.facets;
        const values = facets[this.props.facetName]
          ? facets[this.props.facetName].facetValues
          : [];
        this.setState({ fetching: false, values: values });
      })
      .catch(err => {
        this.setState({ fetching: false, errors: err });
      });
  }

  getIconClass(facet, selected) {
    return (
      'far ' +
      (selected.indexOf(facet.value) > -1 ? 'fa-check-square' : 'fa-square')
    );
  }

  render() {
    if (!this.state.values) {
      return null;
    }
    const selected_values = this.getSelectedValues();

    return (
      <section className="facet-group multi-facet-group">
        <header>{this.props.facetGroup}</header>
        <ul className="facet-values">
          {this.state.values.map(facet => (
            <li key={facet.name}>
              <a
                onClick={e => {
                  this.changeValue(facet);
                }}
              >
                <i className={this.getIconClass(facet, selected_values)} />
                <label>{facet.name}</label>
                <span className="count">{facet.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

export default connect((state, ownProps) => ({
  isSearchPending:
    state[ownProps.searchContext + 'Search'].executedSearch.pending,
  stagedSearch: state[ownProps.searchContext + 'Search'].stagedSearch
}))(MultiFacetGroup);
