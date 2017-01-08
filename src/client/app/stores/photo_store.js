import 'whatwg-fetch';
import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import Actions from '../actions';

class PhotoStore extends EventEmitter {
  constructor() {
    super();
    this.photos = [];
    this.selectedPhotos = [];
    this.fetch = fetch.bind(undefined);
  }

  getAll() {
    return this.photos;
  }

  setAll(photos) {
    this.photos = photos;
    this.emitPhotoChange();
  }

  getSelected() {
    return this.selectedPhotos;
  }

  addSelected(photo) {
    this.selectedPhotos.unshift(photo);
    this.emitSelectedPhotosChange();
  }

  emitPhotoChange() {
    this.emit('photoChange');
  }

  emitSelectedPhotosChange() {
    this.emit('selectedPhotosChange');
  }

  addPhotoChangeListener(callback) {
    this.on('photoChange', callback);
  }

  removePhotoChangeListener(callback) {
    this.off('photoChange', callback);
  }

  addSelectedPhotosChangeListener(callback) {
    this.on('selectedPhotosChange', callback);
  }

  removeSelectedPhotosChangeListener(callback) {
    this.off('selectedPhotosChange', callback);
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
    case 'SELECT_PHOTO':
      photoStore.addSelected(payload.photo);
      break;
    default:
      break;
  }
});

export default photoStore;
