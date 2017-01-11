const socketIo = require('socket.io');

const cameraAdapter = require('./camera_adapter');
const fileSystemAdapter = require('./file_system_adapter');
const printerAdapter = require('./printer_adapter');

const socketAdapter = {
  io: undefined,
  httpServer: undefined,

  startSockets(httpServer) {
    this.io = socketIo(httpServer);

    this.io.on('connection', (socket) => {
      fileSystemAdapter.getPhotos().then(photos => socket.emit('photos', photos));
      socket.on('print', (photos) => {
        printerAdapter.print(photos)
          .then(printName => socket.emit('print_queued', { print_name: printName }));
      });

      socket.on('capture', () => cameraAdapter.capture());
    });
  },
};

module.exports = socketAdapter;
