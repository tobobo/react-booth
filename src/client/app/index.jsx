import React from 'react';
import {render} from 'react-dom';
import {merge} from 'react-lib';
import {Dispatcher} from 'flux';
import {EventEmitter} from 'events';
import 'whatwg-fetch';

const dispatcher = new Dispatcher({
  logLevel: 'ALL'
});

class Actions {
  static loadPhotos() {
    dispatcher.dispatch({ actionType: 'LOAD_PHOTOS' });
  }
}

class PhotoStore extends EventEmitter {
  constructor() {
    super();
    this.photos = [];
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
    fetch('/api/photos/')
      .then(response => response.json())
      .then(body => {
        console.log('body', body);
        dispatcher.dispatch(Object.assign({ actionType: 'RECEIVE_PHOTOS' }, { photos: body }));
      });
  }
}

const photoStore = new PhotoStore();
photoStore.dispatchToken = dispatcher.register((payload) => {
  console.log('payload', payload);
  switch (payload.actionType) {
    case 'LOAD_PHOTOS':
      photoStore.loadPhotos();
      break;
    case 'RECEIVE_PHOTOS':
      console.log('received');
      photoStore.setAll(payload);
      break;
  }
})

class App extends React.Component {
  constructor() {
    super();
    this.state = { photos: photoStore.getAll() };
  }
  componentDidMount() {
    photoStore.addChangeListener(this._onChange.bind(this));
    Actions.loadPhotos();
  }
  _onChange() {
    this.setState({ photos: photoStore.getAll().photos.reverse() });
    setTimeout(() => Actions.loadPhotos(), 100);
  }
  render() {
    const headPhotos = this.state.photos.slice(0, 2);
    const tailPhotos = this.state.photos.slice(2);
    return (
      <div>
        <p>
          {headPhotos.map(function(photo, i) {
            const fileName = `photos/${photo.file_name}`;
            return (
              <img width='600' src={fileName} key={i} />
            );
          })}
        </p>
        {tailPhotos.map(function(photo, i) {
          const fileName = `photos/${photo.file_name}`;
          return (
            <img width='300' src={fileName} key={i} />
          );
        })}
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
