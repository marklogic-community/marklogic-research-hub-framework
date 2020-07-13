'use strict';

var options = require('./options')();
const four0four = require('./404')();
var https = require('https');
var http = require('http');
var q = require('q');
var _ = require('underscore');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const authHeaderLib = require('auth-header');
const md5Hex = require('md5-hex');

var httpClient = http;
if (options.httpsEnabledInBackend) {
  //   console.log('ML Certificate = "' + options.mlCertificate + '"')
  console.log('Will use https client to communicate with MarkLogic.');
  httpClient = https;
} else {
  // console.log('ML Certificate = "' + options.mlCertificate + '"')
  console.log('Will use http client to communicate with MarkLogic.');
}

var defaultOptions = {
  authHost: options.mlHost,
  authPort: options.mlRestPort,
  challengeMethod: 'HEAD',
  challengePath: '/v1/ping'
};

function init() {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(
    new LocalStrategy(
      {
        passReqToCallback: true
      },
      function(req, username, password, done) {
        // Debug info
        //console.log('LocalStrategy callback');
        // console.log(req)
        var reqOptions = {
          hostname: options.mlHost,
          port: options.mlRestPort,
          // FIXME: /v1/documents??
          path: '/v1/documents?uri=/api/users/' + username + '.json',
          headers: {}
        };

        getAuthorization(req.session, reqOptions.method, reqOptions.path, {
          authHost: options.mlHost,
          authPort: options.mlRestPort,
          authUser: username,
          authPassword: password
        })
          .then(function(authorization) {
            if (authorization) {
              reqOptions.headers.Authorization = authorization;
            }

            var login = httpClient.get(reqOptions, function(response) {
              var user = {
                authenticated: true,
                username: username
              };

              if (response.statusCode === 200) {
                response.on('data', function(chunk) {
                  var json = JSON.parse(chunk);
                  if (json.user !== undefined) {
                    user.profile = json.user;
                  } else {
                    console.log('did not find chunk.user');
                  }

                  done(null, user);
                });
              } else if (response.statusCode === 404) {
                // no user profile yet..
                done(null, user);
              } else if (response.statusCode === 401) {
                clearAuthenticator(req.session);
                done(null, false, {
                  message: 'Invalid credentials'
                });
              } else {
                done(null, false, {
                  message: 'API error'
                });
              }
            });
            login.on('error', function(e) {
              console.error(JSON.stringify(e));
              console.error('login failed: ' + e.statusCode);
              done(e);
            });
          })
          .catch(done);
      }
    )
  );
}

function handleLocalAuth(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: info.message
      });
    }

    // Manually establish the session...
    req.login(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
  })(req, res, next);
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    four0four.unauthorized(req, res);
  }
}

function clearAuthenticator(session) {
  delete session.currentAuth;
}

function processAuthenticateHeader(session, challenge) {
  let authHeader = authHeaderLib.parse(challenge);

  return authHeader;
}

function processAuth(
  authHeader,
  username,
  password,
  reqMethod,
  reqPath,
  session
) {
  if (authHeader.scheme === 'Digest') {
    //digest
    let secret = genDigestSecret(username, password, authHeader.params.realm);

    let cnonce = genNonce(10); // opaque random string value provided by the client
    let nc = 0; // count of the number of requests (including the current request) that the client has sent with the nonce value

    let params = {
      cnonce: cnonce,
      nc: nc,
      username: username,
      method: reqMethod,
      uri: reqPath,
      ...authHeader.params
    };
    session.currentAuth = {
      scheme: 'Digest',
      digestParams: params,
      digestSecret: secret
    };

    return HttpDigestHeader(params, secret);
  } else {
    //basic

    let secret = Buffer.from(username + ':' + password).toString('base64');

    session.currentAuth = {
      scheme: 'Basic',
      header: `Basic ${secret}`
    };

    return session.currentAuth.header;
  }
}

function getCurrentAuthorization(session, reqMethod, reqPath) {
  if (!session.currentAuth) {
    return null;
  }

  if (session.currentAuth.scheme === 'Digest') {
    let params = session.currentAuth.digestParams;
    let secret = session.currentAuth.digestSecret;

    params.method = reqMethod;
    params.uri = reqPath;
    params.nc = params.nc + 1;

    session.currentAuth.digestParams = params;

    return HttpDigestHeader(params, secret);
  } else {
    //basic
    return session.currentAuth.header;
  }
}

function getAuth(session, reqOptions) {
  // if GROVE_ALLOW_ANONYMOUS_USERS env var is set then
  // don't give a 401. instead use ML_ANONYMOUS_USERNAME && ML_ANONYMOUS_USERNAME
  // to authenticate as the given anon user
  if (!options.allowAnonymousUsers && !session.passport) {
    return Promise.reject('Unauthorized');
  }
  var passportUser = (session && session.passport && session.passport.user) ? session.passport.user : {};
  return getAuthorization(
    session,
    reqOptions.method || 'GET',
    reqOptions.path,
    {
      authHost: reqOptions.hostname || options.mlHost,
      authPort: reqOptions.port || options.mlRestPort,
      authUser: passportUser.username || options.anonymousUsername,
      authPassword: passportUser.password || options.anonymousPassword
    }
  );
}

function getAuthorization(session, reqMethod, reqPath, authOptions) {
  reqMethod = reqMethod || 'GET';
  let authorization = null;
  var d = q.defer();
  if (!authOptions.authUser) {
    d.reject('Unauthorized');
    return d.promise;
  }
  var mergedOptions = _.extend({}, defaultOptions, authOptions || {});

  authorization = getCurrentAuthorization(session, reqMethod, reqPath);
  if (authorization) {
    d.resolve(authorization);
  } else {
    var challengeReq = httpClient.request(
      {
        hostname: mergedOptions.authHost,
        port: mergedOptions.authPort,
        method: mergedOptions.challengeMethod,
        path: mergedOptions.challengePath
      },
      function(response) {
        var statusCode = response.statusCode;
        var challenge = response.headers['www-authenticate'];

        var hasChallenge = challenge !== null;
        if (statusCode === 401 && hasChallenge) {
          let authHeader = processAuthenticateHeader(session, challenge);

          let authorization = processAuth(
            authHeader,
            mergedOptions.authUser,
            mergedOptions.authPassword,
            reqMethod,
            reqPath,
            session
          );

          d.resolve(authorization);
        } else {
          session.currentAuth = null;
          d.reject('Unauthorized');
        }
      }
      // TODO: capture error response?
    );
    challengeReq.on('error', function challengeReqError(error) {
      console.error(
        '\nReceived the following error when trying to connect to MarkLogic: ' +
          error.stack
      );
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
        console.error(
          'Please ensure that MarkLogic is running on the host specified by GROVE_ML_HOST (currently "' +
            options.mlHost +
            '") and the port specified by GROVE_ML_REST_PORT (currently "' +
            options.mlRestPort +
            '"). See the README for more information.'
        );
      }
      d.reject(error);
    });
    challengeReq.end();
  }
  return d.promise;
}

function genNonce(b) {
  var c = [],
    e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    a = e.length;
  for (var d = 0; d < b; ++d) {
    c.push(e[(Math.random() * a) | 0]);
  }
  return c.join('');
}

function genDigestSecret(username, password, realm) {
  return md5Hex(username + ':' + realm + ':' + password);
}

function HttpDigestHeader(params, SECRET) {
  /*
    {
        nc: optional,
        cnonce: optional,
        username: username,
        method: reqMethod,
        uri: reqPath,
        realm: 'public',
        qop: 'auth',
        nonce: '379fb206fbe88e:urD2gEqZJ7ApwKmJHDz1Gw==',
        opaque: '9d9c655418122b53' }
    */
  let nonce = params.nonce; // unique string value specified by the server
  let realm = params.realm; // authentication realm, defaults to "IsmuserAPI"

  let qop = params.qop; // list of quality of protection values supported by the server (auth | auth-int); auth set.

  let USER = params.username;
  let method = params.method;
  let URI = params.uri;

  let cnonce = params.cnonce; // opaque random string value provided by the client
  let nc = params.nc; // count of the number of requests (including the current request) that the client has sent with the nonce value

  //then use previous and increment nonce
  if (params.cnonce == null || params.nc == null) {
    //generate
    cnonce = genNonce(10);
    nc = 0;
  }

  //SECRET = md5Hex(user:realm:pass)

  // ha2 = md5Hex(method:uri)
  let HA2 = md5Hex(method + ':' + URI);

  // response = md5Hex((SECRET + ":" + nonce + ":" + nc + ":" + cnonce + ":" + qop + ":" + HA2)
  let response = md5Hex(`${SECRET}:${nonce}:${nc}:${cnonce}:${qop}:${HA2}`);

  const header = `Digest username="${USER}", realm="${realm}", nonce="${nonce}", uri="${URI}", cnonce="${cnonce}", nc="${nc}", qop="${qop}", response="${response}"`;

  return header;
}

var authHelper = {
  init: init,
  isAuthenticated: isAuthenticated,
  handleLocalAuth: handleLocalAuth,
  getAuthorization: getAuthorization,
  getAuth: getAuth,
  clearAuthenticator: clearAuthenticator
};

module.exports = authHelper;
