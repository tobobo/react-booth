import dispatcher from './dispatcher';

export default class Actions {
  static loadPhotos() {
    dispatcher.dispatch({ actionType: 'LOAD_PHOTOS' });
  }

  static receivePhotos(photoBody) {
    dispatcher.dispatch(Object.assign({ actionType: 'RECEIVE_PHOTOS' }, { photos: photoBody }));
  }
}
