import React from 'react';
import { render } from 'react-dom';
import photoStore from './stores/photo_store';
import BaseComponent from './components/base';
import Photo from './components/photo';

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
    const headPhotos = this.state.photos.slice(0, 2);
    const tailPhotos = this.state.photos.slice(2, 26);
    return (
      <div>
        <div>
          {headPhotos.map(photo => <Photo photo={photo} key={photo.file_name} width={600} />)}
        </div>
        <div>
          {tailPhotos.map(photo => <Photo photo={photo} key={photo.file_name} width={300} />)}
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
