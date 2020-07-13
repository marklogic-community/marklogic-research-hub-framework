'use strict';

var provider = (function() {
  var fs = require('fs');
  var express = require('express');
  var helmet = require('helmet');
  var expressSession = require('express-session');
  const { constants } = require('crypto');
  const compression = require('compression');
  var MemoryStore = require('memorystore')(expressSession);

  var provide = function(config) {
    var app = express();
    var logger = require('morgan');
    app.use(logger('dev'));

    var four0four = require('../grove-node-server-utils/404')();
    var http = require('http');
    var https = require('https');
    var passport = require('passport');
    var authHelper = require('../grove-node-server-utils/auth-helper');
    var options = require('../grove-node-server-utils/options')();
    var port = options.appPort;

    authHelper.init(); // FIXME: is this thread-safe? what if we spin up two listeners in one script?

    // compress all responses
    if (options.compressResponses) {
      app.use(compression());
    }

    // Making this middle-tier slightly more secure: https://www.npmjs.com/package/helmet#how-it-works
    app.use(
      helmet({
        csp: {
          // enable and configure
          directives: {
            defaultSrc: ['"self"']
          },
          setAllHeaders: true
        },
        dnsPrefetchControl: true, // just enable, with whatever defaults
        xssFilter: {
          // enabled by default, but override defaults
          setOnOldIE: true
        },
        noCache: false // make sure it is disabled
      })
    );

    app.use(
      expressSession({
        name: options.appName,
        secret: options.sessionSecret,
        saveUninitialized: true,
        resave: true,
        rolling: true,
        cookie: { maxAge: 172800000 }, //expire sessions after 2 days of inactivity
        store: new MemoryStore({
          checkPeriod: 86400000 // prune expired entries every 24h
        })
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(config.routes); // FIXME: check for routes, and throw error if not

    app.use(four0four.notFound);

    let server;
    if (options.useHTTPSInMiddleTier) {
      // Docs on how to create self signed certificates
      // https://devcenter.heroku.com/articles/ssl-certificate-self#prerequisites
      if (!options.middleTierSSLCertificate || !options.middleTierSSLKey) {
        throw new Error(
          'When using HTTPS, you must set GROVE_MIDDLETIER_SSLCERT to point to your SSL certification and GROVE_MIDDLE_TIER_SSL_KEY to point to your SSL private key.'
        );
      }
      console.log('Starting the server in HTTPS');
      console.log(process.cwd());
      var privateKey = fs.readFileSync(options.middleTierSSLKey, 'utf8');
      var certificate = fs.readFileSync(
        options.middleTierSSLCertificate,
        'utf8'
      );
      var credentials = {
        secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
        key: privateKey,
        cert: certificate
      };
      if (options.middleTierCA) {
        credentials.ca = fs.readFileSync(options.middleTierCA, 'utf8');
      }
      server = https.createServer(credentials, app);
    } else {
      console.log('Starting the server in HTTP');
      server = http.createServer(app);
    }

    server.listen(port, function() {
      console.log('Express server listening on port ' + port);
      /* eslint-disable no-path-concat */
      // console.log('env = ' + app.get('env') +
      //   '\n__dirname = ' + __dirname +
      //   '\nprocess.cwd = ' + process.cwd())
      /* eslint-enable no-path-concat */
    });

    server.timeout = 0;

    return server;
  };
  return provide;
})();

module.exports = provider;
