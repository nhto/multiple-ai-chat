
import logger from '../../utilities/logger';
import * as config from '../../utilities/config';
import http from 'http';
import express from 'express';

function startServer(expressApp: express.Express) {
  /**
   * Create HTTP server.
   */
  logger.debug('Initializing http lisener...');
  const server = http.createServer(expressApp);
  logger.debug('Initializing http lisener completed.');

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(config.HTTP_LISTEN_PORT);
  server.on('error', onError);
  server.on('listening', onListening);


  /**
   * Event listener for HTTP server "error" event.
   */
  function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof config.HTTP_LISTEN_PORT === 'string'
      ? 'Pipe ' + config.HTTP_LISTEN_PORT
      : 'Port ' + config.HTTP_LISTEN_PORT;

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

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr?.port;
    logger.info('Listening on ' + bind);
  }

}

export default startServer;