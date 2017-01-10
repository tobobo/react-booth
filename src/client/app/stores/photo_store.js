import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import SocketAdapter from '../adapters/socket_adapter';

const MAX_SELECTED_PHOTOS = 4;

class PhotoStore extends EventEmitter {
  constructor() {
    super();
    this.photos = [];
    this.selectedPhotos = [];
    this.maxSelectedPhotos = MAX_SELECTED_PHOTOS;
    this.apiAdapter = SocketAdapter;
    this.apiAdapter.setupPhotos();
  }

  getAll() {
    return this.photos;
  }

  setAll(photos) {
    photos.forEach((photo) => {
      const loadedPhoto = photo;
      const photoAlreadySelected = this.selectedPhotos.find(
        selectedPhoto => selectedPhoto.file_name === loadedPhoto.file_name,
      );
      if (photoAlreadySelected) loadedPhoto.selected = true;
    });
    this.photos = photos;
    this.emitPhotoChange();
  }

  addOnePhoto(photo) {
    this.photos.push(photo);
    this.emitPhotoChange();
  }

  getSelected() {
    return this.selectedPhotos;
  }

  addSelected(photo) {
    const selectedPhotos = this.getSelected().concat([photo]);
    const unselectedPhotos = selectedPhotos.slice(0, -MAX_SELECTED_PHOTOS);
    unselectedPhotos.forEach(unselectedPhoto => this.removeAndEmit(unselectedPhoto));
    this.selectedPhotos = selectedPhotos.slice(-MAX_SELECTED_PHOTOS);
    this.emitSelectedPhotosChange();
  }

  removeFromSelectedArray(photoToRemove) {
    let photoRemoved = false;
    this.selectedPhotos = this.getSelected().reduce((memo, photo) => {
      if (photo.file_name === photoToRemove.file_name) {
        photoRemoved = true;
      } else {
        memo.push(photo);
      }
      return memo;
    }, []);
    return photoRemoved;
  }

  removeAndEmit(photoToRemove) {
    if (this.removeFromSelectedArray(photoToRemove)) this.emitPhotoRemoved(photoToRemove);
  }

  handleDeselection(photoToRemove) {
    this.removeFromSelectedArray(photoToRemove);
    this.emitSelectedPhotosChange();
  }

  emitPhotoChange() {
    this.emit('photoChange');
  }

  emitSelectedPhotosChange() {
    this.emit('selectedPhotosChange');
  }

  emitPhotoRemoved(photo) {
    this.emit('selectedPhotoRemoved', photo);
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

  addSelectedPhotoRemovedListener(callback) {
    this.on('selectedPhotoRemoved', callback);
  }

  removeSelectedPhotoRemovedListener(callback) {
    this.off('selectedPhotoRemoved', callback);
  }

  photosPrintable() {
    return this.selectedPhotos.length === MAX_SELECTED_PHOTOS;
  }

  printSelected() {
    if (!this.photosPrintable()) return;
    this.apiAdapter.print(this.getSelected());
  }

  capture() {
    this.apiAdapter.capture();
  }
}

const photoStore = new PhotoStore();

photoStore.dispatchToken = dispatcher.register((payload) => {
  switch (payload.actionType) {
    case 'LOAD_PHOTOS':
      photoStore.loadPhotos();
      break;
    case 'RECEIVE_PHOTOS':
      photoStore.setAll(payload.photos);
      break;
    case 'RECEIVE_PHOTO':
      photoStore.addOnePhoto(payload.photo);
      break;
    case 'SELECT_PHOTO':
      photoStore.addSelected(payload.photo);
      break;
    case 'DESELECT_PHOTO':
      photoStore.handleDeselection(payload.photo);
      break;
    case 'PRINT_SELECTED_PHOTOS':
      photoStore.printSelected();
      break;
    case 'CAPTURE':
      photoStore.capture();
      break;
    default:
      break;
  }
});

export default photoStore;
