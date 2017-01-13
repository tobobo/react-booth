const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const config = require('../../../config');
const log = require('../lib/log_helper');
const socketAdapter = require('./socket_adapter');

const PHOTO_DIR = config.photoDir;
const SERVER_PORT = config.port;

const httpAdapter = {
  app: undefined,
  httpServer: undefined,

  startServer() {
    this.app = express();
    this.httpServer = http.Server(this.app);

    this.app.use(bodyParser.json());
    this.app.use(express.static('./src/client'));
    this.app.use(`/${PHOTO_DIR}`, express.static(PHOTO_DIR));

    this.httpServer.listen(SERVER_PORT, () => log(`listening on ${SERVER_PORT}`));
    socketAdapter.startSockets(this.httpServer);
  },
};

module.exports = httpAdapter;
