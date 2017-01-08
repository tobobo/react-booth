import 'whatwg-fetch';
import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import Actions from '../actions';

class PhotoStore extends EventEmitter {
  constructor() {
    super();
    this.photos = [];
    this.fetch = fetch.bind(undefined);
  }

  getAll() {
    return this.photos;
  }

  setAll(photos) {
    this.photos = photos;
    this.emitChange();
  }

  emitChange() {
    this.emit('change');
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.off('change', callback);
  }

  loadPhotos() {
    this.fetch('/api/photos/')
      .then(response => response.json())
      .then((body) => { Actions.receivePhotos(body); })
      .catch();
  }
}

const photoStore = new PhotoStore();

photoStore.dispatchToken = dispatcher.register((payload) => {
  switch (payload.actionType) {
    case 'LOAD_PHOTOS':
      photoStore.loadPhotos();
      break;
    case 'RECEIVE_PHOTOS':
      photoStore.setAll(payload);
      break;
    default:
      break;
  }
});

export default photoStore;
