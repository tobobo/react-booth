import Actions from '../actions';

// eslint-disable-next-line no-undef
const socket = io();

class SocketAdapter {
  static setupPhotos() {
    socket.on('photos', (photos) => {
      Actions.receivePhotos(photos);
    });

    socket.on('photo', (photo) => {
      Actions.receiveOnePhoto(photo);
    });

    socket.on('print_queue', (photos) => {
      Actions.printRequestComplete(photos);
    });
  }

  static print(photos) {
    socket.emit('print', photos);
  }

  static capture() {
    socket.emit('capture');
  }
}

export default SocketAdapter;
