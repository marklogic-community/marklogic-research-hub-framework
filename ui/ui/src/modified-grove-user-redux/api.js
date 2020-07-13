/* globals require */
require('isomorphic-fetch');

export default {
  login: (username, password) => {
    return fetch(new URL('/api/auth/login', document.baseURI).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ username, password })
    });
  },
  logout: () => {
    return fetch(new URL('/api/auth/logout', document.baseURI).toString(), {
      method: 'POST',
      credentials: 'same-origin'
    }).then(
      response => {
        return response;
      },
      error => {
        /* eslint-disable no-console */
        console.log('error:', error);
        /* eslint-enable no-console */
        throw error;
      }
    );
  },
  status: () => {
    return fetch(new URL('/api/auth/status', document.baseURI).toString(), {
      method: 'GET',
      credentials: 'same-origin'
    }).then(
      response => {
        if (!response.ok) {
          return response.json().then(error => {
            throw new Error(error.message);
          });
        }
        return response.json();
      },
      error => {
        /* eslint-disable no-console */
        console.log('error:', error);
        /* eslint-enable no-console */
        throw error;
      }
    );
  }
};
