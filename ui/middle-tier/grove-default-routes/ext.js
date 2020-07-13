'use strict';

var provider = (function() {
  const backend = require('../grove-node-server-utils/backend');
  //const fs = require('fs')
  const four0four = require('../grove-node-server-utils/404')();
  //const options = require('../grove-node-server-utils/options')()

  var ca = '';
  // FIXME: better handled inside options?
  // if (options.mlCertificate) {
  //   console.log('Loading ML Certificate ' + options.mlCertificate)
  //   ca = fs.readFileSync(options.mlCertificate)
  // }

  // Note: config should not reveal any implementation details
  var provide = function(config) {
    const authProvider = config.authProvider;
    if (!authProvider) {
      throw new Error(
        'defaultCrudRoute configuration must include an authProvider'
      );
    }

    const router = require('express').Router();

    var contentType = config.contentType || 'application/json';

    // by default all EXT calls are shielded by authentication
    var authed = config.authed !== undefined ? config.authed : true;
    if (authed) {
      router.use(authProvider.isAuthenticated);
    }

    router.all('/:action', function(req, res) {
      var method = req.method;
      const actionName = req.params.action;
      const action = config.actions[actionName];

      // reply with 405 if a non-allowed method is used
      let methods = allowedActionMethods(action);
      if (methods.indexOf(method) < 0) {
        four0four.methodNotAllowed(req, res, methods);
        return;
      }

      // reply with 415 if body doesn't match expected Content-Type
      let cType = action ? action.contentType : contentType;
      if (expectBody(method) && !req.is(cType)) {
        four0four.unsupportedMediaType(req, res, [cType]);
        return;
      }

      var data = [];
      req.on('data', function(chunk) {
        data.push(chunk);
      });
      req.on('end', function() {
        var body = Buffer.concat(data).toString();
        var params = req.params;

        var tmp = action[method](body, params, req);
        method = tmp.method;
        body = tmp.body;
        params = tmp.params;

        docsBackendCall(
          req,
          res,
          config,
          method,
          action.uri || '/v1/resources/' + action,
          params,
          function(backendResponse, data) {
            res.status(backendResponse.statusCode);
            for (var header in backendResponse.headers) {
              // copy all others except auth challenge headers
              if (header !== 'www-authenticate') {
                res.header(header, backendResponse.headers[header]);
              }
            }
            res.write(data);
            res.end();
          },
          body
        );
      });
    });

    return router;
  };

  function docsBackendCall(
    req,
    res,
    config,
    method,
    uri,
    params,
    callback,
    body
  ) {
    var backendOptions = {
      method: method,
      path: uri,
      params: params,
      headers: req.headers,
      ca: ca
    };

    if (body) {
      backendOptions.body = body;
    }

    config.authProvider.getAuth(req.session, backendOptions).then(
      function(authorization) {
        if (authorization) {
          backendOptions.headers.authorization = authorization;
        }

        var neverCache =
          config.neverCache !== undefined ? config.neverCache : true;
        if (neverCache || req.method !== 'GET') {
          noCache(res);
        }

        // call backend, and pipe clientResponse straight into res
        backend.call(req, backendOptions, callback);
      },
      function() {
        // TODO: might return an error too?
        four0four.unauthorized(req, res);
      }
    );
  }

  function allowedActionMethods(action) {
    let methods = [];
    if (action.GET) {
      methods.push('GET');
    }
    if (action.POST) {
      methods.push('POST');
    }
    if (action.PUT) {
      methods.push('PUT');
    }
    if (action.DELETE) {
      methods.push('DELETE');
    }
    return methods;
  }

  function expectBody(method) {
    return ['POST', 'PUT'].indexOf(method) > -1;
  }

  function noCache(response) {
    response.append('Cache-Control', 'no-cache, must-revalidate'); // HTTP 1.1 - must-revalidate
    response.append('Pragma', 'no-cache'); // HTTP 1.0
    response.append('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT'); // Date in the past
  }

  return provide;
})();

module.exports = provider;
