const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const config = require('../../config');
const log = require('./lib/log_helper');
const cameraAdapter = require('./adapters/camera_adapter');
const imageConversionAdapter = require('./adapters/image_conversion_adapter');
const socketAdapter = require('./adapters/socket_adapter');

const PHOTO_DIR = config.photoDir;
const SERVER_PORT = config.port;

const app = express();
const httpServer = http.Server(app);

app.use(bodyParser.json());
app.use(express.static('./src/client'));
app.use(`/${PHOTO_DIR}`, express.static(PHOTO_DIR));

cameraAdapter.runDownloadProcess();
imageConversionAdapter.watchPhotoDirectory((photoPath) => {
  socketAdapter.io.emit('photo', { file_name: path.basename(photoPath) });
});
socketAdapter.startSockets(httpServer);

httpServer.listen(SERVER_PORT, () => log(`listening on ${SERVER_PORT}`));
