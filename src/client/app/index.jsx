import React from 'react';
import { render } from 'react-dom';
import BaseComponent from './components/base';
import SelectedPhotos from './components/selected_photos';
import PreviewPhotos from './components/preview_photos';

class App extends BaseComponent {
  render() {
    return (
      <div>
        <div className="preview-column">
          <SelectedPhotos />
        </div>
        <PreviewPhotos />
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
