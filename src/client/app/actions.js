import dispatcher from './dispatcher';

export default class Actions {
  static loadPhotos() {
    dispatcher.dispatch({ actionType: 'LOAD_PHOTOS' });
  }

  static receivePhotos(photoBody) {
    dispatcher.dispatch({ actionType: 'RECEIVE_PHOTOS', photos: photoBody });
  }

  static selectPhoto(photo) {
    dispatcher.dispatch({ actionType: 'SELECT_PHOTO', photo });
  }

  static deselectPhoto(photo) {
    dispatcher.dispatch({ actionType: 'DESELECT_PHOTO', photo });
  }
}
