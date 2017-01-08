import React from 'react';
import { render } from 'react-dom';
import photoStore from './stores/photo_store';
import BaseComponent from './components/base';
import Photo from './components/photo';

const NUM_LARGE_PHOTOS = 2;
const NUM_SMALL_PHOTOS = 24;

class App extends BaseComponent {
  constructor() {
    super();
    this.state = { photos: photoStore.getAll() };
  }

  componentDidMount() {
    photoStore.addChangeListener(this.changeListener);
    this.actions.loadPhotos();
  }

  componentWillUnmount() {
    photoStore.removeChangeListener(this.changeListener);
  }

  onChange() {
    this.setState({ photos: photoStore.getAll().photos.reverse() });
    setTimeout(() => this.actions.loadPhotos(), 100);
  }

  render() {
    const largePhotos = this.state.photos.slice(0, NUM_LARGE_PHOTOS);
    const smallPhotos = this.state.photos.slice(
      NUM_LARGE_PHOTOS,
      NUM_LARGE_PHOTOS + NUM_SMALL_PHOTOS,
    );
    return (
      <div>
        <div>
          {largePhotos.map(photo => <Photo photo={photo} key={photo.file_name} width={600} />)}
        </div>
        <div>
          {smallPhotos.map(photo => <Photo photo={photo} key={photo.file_name} width={300} />)}
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
