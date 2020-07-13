'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Read environment variables
require('./grove-node-server-utils/readEnv').readEnv();

var routes = require('./routes');
var server = require('./grove-node-server').defaultNodeServer({
  routes: routes
});

let nodeOptions = require('./grove-node-server-utils/options')();
let keepCacheHotTimeMs = nodeOptions.sparqlCacheRefreshInterval;
function keepCacheHot() {
  let http = require('http');
  let port = nodeOptions.appPort;

  let options = {
    host: 'localhost',
    port: port,
    path: '/v1/resources/sparqlCache'
  };
  let callback = function(response) {
    var str = '';

    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been received, so we just print it out here
    response.on('end', function () {
      console.log('keepCacheHot: ' + str);

      setTimeout(keepCacheHot, keepCacheHotTimeMs);
    });
  }

  http.request(options, callback).end();
}
if (keepCacheHotTimeMs && keepCacheHotTimeMs > 0) {
  console.log('keepCacheHot: keeping cache hot every ' + keepCacheHotTimeMs + ' ms');
  keepCacheHot();
}
else {
  console.log('keepCacheHot: not keeping cache hot');
}

// TODO: expose app, routes, and server all three?
module.exports = server;
