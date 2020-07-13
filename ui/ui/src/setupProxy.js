const proxy = require('http-proxy-middleware');

function bool(val, def) {
  if (val !== undefined || val !== null) {
    return '' + val === 'true';
  } else {
    return def;
  }
}

const appHost = process.env.REACT_APP_MIDDLETIER_HOST || 'localhost';
const appPort = process.env.REACT_APP_MIDDLETIER_PORT || '9003';
const appMiddletierUsesHttps = bool(
  process.env.REACT_APP_HTTPS_ENABLED_IN_MIDDLETIER,
  false
);

const middletierUrl =
  (appMiddletierUsesHttps ? 'https' : 'http') + '://' + appHost + ':' + appPort;

// Http Proxy Middleware options
// SEE all options @ https://github.com/chimurai/http-proxy-middleware#options
const options = {
  target: middletierUrl, // target host. URL string to be parsed with the url module
  changeOrigin: true, // true/false, Default: false - changes the origin of the host header to the target URL. Needed for virtual hosted sites
  ws: false, // true/false: if you want to proxy websockets
  secure: false, //  true/false, if you want to verify the SSL Certs
  logLevel: 'info', // string, ['debug', 'info', 'warn', 'error', 'silent']. Default: 'info'
  onProxyReq: proxyReq => {
    // function, subscribe to http-proxy's proxyReq event.
    // add custom header to request
    //proxyReq.setHeader('cookie', null); // !!! NOTE: This prevents the requests from send ANY cookie info in the headers. This was causing issues with the server.
  },
  onError: (err, res) => {
    console.log(err);
  }
};

// create the proxy (without context)
const developmentProxy = proxy(options);

module.exports = function(app) {
  app.use('/api', developmentProxy);
  app.use('/v1', developmentProxy);
};
