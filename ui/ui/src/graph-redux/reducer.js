import * as types from './actionTypes';

const graph = (state = {}, action) => {
  switch (action.type) {
    case types.GRAPH_DATA_REQUESTED:
      return {
        ...state,
        pending: true
      };
    case types.GET_GRAPH_DATA_SUCCESS:
      return {
        ...state,
        data: action.payload.data,
        pending: false
      };
    case types.GET_GRAPH_DATA_ERROR:
      return {
        ...state,
        error: action.payload.error,
        pending: false
      };
  }
  return state;
};

export const selectors = {
  graphData: state => {
    return state.data;
  }
};

export default graph;
