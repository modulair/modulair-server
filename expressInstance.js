var app       = require('./app');
var api       = require('./api');

var http      = require('http');
var chalk     = require('chalk');

var server    = http.createServer(app);
var apiServer = http.createServer(api);


var port      = normalizePort(process.env.PORT || '3210');
var apiPort   = normalizePort(process.env.APIPORT || '3211');

app.set('port', port);
api.set('port', apiPort);

server.listen(port, function () {
  console.log(chalk.bold.gray.bgWhite('scratch-server')+chalk.white(' started on port ') + chalk.bold.white.bgBlue(port));
});
server.on('error', onError);
apiServer.listen(apiPort, function () {
  console.log(chalk.bold.gray.bgYellow('api-server')+chalk.white(' started on port ') + chalk.bold.white.bgBlue(apiPort));
});
apiServer.on('error', onError);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

exports.apiServer = apiServer;
