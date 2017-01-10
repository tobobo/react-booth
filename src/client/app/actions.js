import dispatcher from './dispatcher';

export default class Actions {
  static loadPhotos() {
    dispatcher.dispatch({ actionType: 'LOAD_PHOTOS' });
  }

  static receivePhotos(photoBody) {
    dispatcher.dispatch({ actionType: 'RECEIVE_PHOTOS', photos: photoBody });
  }

  static receiveOnePhoto(photo) {
    dispatcher.dispatch({ actionType: 'RECEIVE_PHOTO', photo });
  }

  static selectPhoto(photo) {
    dispatcher.dispatch({ actionType: 'SELECT_PHOTO', photo });
  }

  static deselectPhoto(photo) {
    dispatcher.dispatch({ actionType: 'DESELECT_PHOTO', photo });
  }

  static printSelectedPhotos() {
    dispatcher.dispatch({ actionType: 'PRINT_SELECTED_PHOTOS' });
  }

  static printRequestComplete(photos) {
    dispatcher.dispatch({ actionType: 'PRINT_COMPLETE', photos });
  }

  static capture() {
    dispatcher.dispatch({ actionType: 'CAPTURE' });
  }
}
