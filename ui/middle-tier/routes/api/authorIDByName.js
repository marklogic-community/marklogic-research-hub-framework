'use strict';
const provider = function(config) {
  const router = require('express').Router();
  const backend = require('../../grove-node-server-utils/backend');

  const authProvider = config.authProvider;
  if (!authProvider) {
    throw new Error(
      'authorIDByName configuration must include an authProvider'
    );
  }

  const idConverter = config.idConverter || {
    toId: function(uri) {
      return encodeURIComponent(uri);
    },
    toUri: function(id) {
      return decodeURIComponent(id);
    }
  };

  // by default all calls are shielded by authentication
  var authed = config.authed !== undefined ? config.authed : true;
  if (authed) {
    router.use(config.authProvider.isAuthenticated);
  }

  router.get('/', (req, res) => {
    const backendOptions = {
      method: 'GET',
      path: '/v1/resources/authorIdByPreferredName',
      params: { 'rs:preferredName': req.query.name },
      headers: req.headers
    };

    config.authProvider
      .getAuth(req.session, backendOptions)
      .then(authorization => {
        if (authorization) {
          backendOptions.headers.authorization = authorization;
        }
        backend.call(req, backendOptions, (backendResponse, data) => {
          res.status(backendResponse.statusCode);
          for (var header in backendResponse.headers) {
            // copy all others except auth challenge headers
            if (header !== 'www-authenticate') {
              res.header(header, backendResponse.headers[header]);
            }
          }
          const json = JSON.parse(data.toString());
          res.send({ id: json.uri ? idConverter.toId(json.uri) : null });
        });
      });
  });

  return router;
};

module.exports = provider;