import * as types from './actionTypes';

require('isomorphic-fetch');

// http://localhost:8011/v1/resources/graph?rs:id=/PubMedData/PMID-29499616.xml

export const getGraphData = uri => {
  return async dispatch => {
    dispatch({
      type: types.GRAPH_DATA_REQUESTED,
      payload: { uri: uri }
    });
    let data = {};
    try {
      const url = new URL('/v1/resources/graph', document.baseURI);
      const id = Array.isArray(uri)
        ? uri.map(encodeURIComponent).join(',')
        : encodeURIComponent(uri);
      url.searchParams.append('rs:id', id);
      const response = await fetch(url.toString());
      data = await response.json();
      if (data && data.nodes) {
        data.nodes.forEach(node => {
          if (node.group) {
            node.group = node.group.toLowerCase();
          }
        });
      }
      dispatch({
        type: types.GET_GRAPH_DATA_SUCCESS,
        payload: { data: data }
      });
    } catch (error) {
      dispatch({
        type: types.GET_GRAPH_DATA_ERROR,
        payload: { error: error }
      });
    }
    return data;
  };
};
