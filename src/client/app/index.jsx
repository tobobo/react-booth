import React from 'react';
import { render } from 'react-dom';
import BaseComponent from './components/base';
import SelectedPhotos from './components/selected_photos';
import Photo from './components/photo';

const NUM_LARGE_PHOTOS = 0;
const NUM_SMALL_PHOTOS = 24;

class App extends BaseComponent {
  constructor() {
    super();
    this.state = {
      photos: this.photoStore.getAll(),
      selectedPhotos: this.photoStore.getSelected(),
    };
  }

  componentDidMount() {
    this.photoStore.addPhotoChangeListener(this.changeListener);
    this.actions.loadPhotos();
  }

  componentWillUnmount() {
    this.photoStore.removePhotoChangeListener(this.changeListener);
  }

  onChange() {
    this.setState({ photos: this.photoStore.getAll().photos.reverse() });
    setTimeout(() => this.actions.loadPhotos(), 100);
  }

  render() {
    const photos = this.state.photos.slice(0, NUM_LARGE_PHOTOS + NUM_SMALL_PHOTOS);
    return (
      <div>
        <SelectedPhotos />
        {
          photos.map((photo, i) =>
            <span key={photo.file_name}>
              <Photo
                photo={photo}
                width={i >= NUM_LARGE_PHOTOS ? 200 : 600}
              />
              <span>{i === NUM_LARGE_PHOTOS - 1 ? <br /> : ''}</span>
            </span>,
          )
        }
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
