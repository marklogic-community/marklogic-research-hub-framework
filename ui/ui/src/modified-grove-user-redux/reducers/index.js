import * as types from '../actionTypes';
export default (state = {}, action) => {
  let username;
  switch (action.type) {
    case types.NETWORK_LOGIN_SUCCESS:
      username = action.payload.user.username;
      return {
        ...state,
        [username]: {
          ...state[username],
          isAuthenticated: true
        }
      };
    case types.NETWORK_LOGOUT_SUCCESS:
      return {
        ...state,
        [action.payload.username]: {
          ...state[action.payload.username],
          isAuthenticated: false
        }
      };
    case types.SET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload.username
      };
    case types.LOCAL_LOGOUT: {
      let stateClone = Object.assign({}, state);
      delete stateClone.currentUser;
      return stateClone;
    }
    case types.FETCH_AUTHSTATUS_SUCCESS: {
      const newState = {
        ...state,
        currentUser: action.payload.user.username
      };
      username = action.payload.user.username || state.currentUser;
      if (username) {
        newState[username] = {
          ...state[username],
          isAuthenticated: action.payload.user.authenticated
        };
      }
      return newState;
    }
    default:
      return state;
  }
};

const currentUser = state => state.currentUser;
const isAuthenticated = (state, user) =>
  state[user] && state[user].isAuthenticated;

const selectors = {
  isAuthenticated: (state, user) => state[user] && state[user].isAuthenticated,
  isCurrentUserAuthenticated: state => {
    const user = currentUser(state);
    return !!user && isAuthenticated(state, user);
  },
  currentUser
};

export { selectors };
