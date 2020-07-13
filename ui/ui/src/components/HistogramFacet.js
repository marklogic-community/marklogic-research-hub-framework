import React from 'react';
import { connect } from 'react-redux';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class HistogramFacet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: false,
      errors: null,
      values: [],
      selectionMinMax: null,
      series: null,
      categories: null
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
          ? facets[this.props.facetName].facetValues.reverse()
          : [];
        this.setState({ fetching: false, values: values });
        this.setState({
          series: {
            name: 'Count',
            showInLegend: false,
            data: values.map(v => v.count)
          },
          categories: values.map(v => v.value)
        });
      })
      .catch(err => {
        this.setState({ fetching: false, errors: err });
      });
  }

  setSelectionMinMax(selectionMinMax) {
    if (selectionMinMax) {
      const [min, max] = selectionMinMax;
      const selectedCategoryValues = this.state.categories.slice(
        Math.floor(min + 0.5),
        Math.ceil(max + 0.5)
      );
      if (selectedCategoryValues.length > 0) {
        this.props.replaceFilter(selectedCategoryValues, {
          boolean: 'or'
        });
      }
    }

    this.setState({ selectionMinMax: selectionMinMax });
  }

  render() {
    let values = this.state.values;
    let replaceFilter = this.props.replaceFilter;

    const highchartsOptions = {
      chart: {
        type: 'bar',
        height: '300px',
        zoomType: 'x',
        zoomKey: 'alt',
        panning: true,
        panKey: 'shift',
        events: {
          selection: event => {
            if (event.xAxis) {
              let min = event.xAxis[0].min;
              let max = event.xAxis[0].max;

              // default sorting is alphabetic. Doh! Javascript!
              this.setSelectionMinMax([min, max].sort((a, b) => a - b));
            }
            return false;
          }
        }
      },
      credits: { enabled: false },
      plotOptions: {
        series: {
          pointPadding: 0,
          groupPadding: 0,
          cursor: 'pointer',
          events: {
            click: event => {
              // HighChart could trigger the same click event multiple times!
              // We avoid the extra redraws by checking the coordinate of the mouse click
              let lastSelectedPoint = this.state.lastSelectedPoint;
              if (
                lastSelectedPoint != null &&
                event.point.x === lastSelectedPoint.x &&
                event.point.y === lastSelectedPoint.y
              ) {
                return;
              } else {
                this.setState({ lastSelectedPoint: event.point });
              }

              const value = values.filter(
                v => v.value === event.point.category
              )[0];
              if (value && value.name) {
                replaceFilter(value.name, { boolean: 'or' });
              }
            }
          }
        }
      },
      title: '',
      xAxis: {
        title: {
          text: null
        }
      },
      yAxis: {
        title: {
          text: null
        },
        labels: {
          step: 12
        },
        minRange: 1
      },
      mapNavigation: {
        enableMouseWheelZoom: true
      }
    };

    let series = this.state.series;
    let categories = this.state.categories;

    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          ...highchartsOptions,
          series,
          xAxis: { ...highchartsOptions.xAxis, categories }
        }}
      />
    );
  }
}

export default connect((state, ownProps) => ({
  isSearchPending:
    state[ownProps.searchContext + 'Search'].executedSearch.pending,
  stagedSearch: state[ownProps.searchContext + 'Search'].stagedSearch
}))(HistogramFacet);
