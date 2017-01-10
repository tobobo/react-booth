import React from 'react';
import throttle from 'lodash/throttle';
import BaseComponent from './base';
import Photo from './photo';

class SelectedPhotos extends BaseComponent {
  constructor() {
    super();
    this.state = this.getPhotoState();
    this.printSelectedPhotos = throttle(() => this.actions.printSelectedPhotos(), 1000);
  }

  getPhotoState() {
    return {
      photos: this.getSelectedPhotos(),
      printable: this.photoStore.photosPrintable(),
    };
  }

  getSelectedPhotos() {
    return this.photoStore.getSelected();
  }

  componentDidMount() {
    this.photoStore.addSelectedPhotosChangeListener(this.changeListener);
  }

  componentWillUnmount() {
    this.photoStore.removeSelectedPhotosChangeListener(this.changeListener);
  }

  onChange() {
    this.setState(this.getPhotoState());
  }

  printSelectedPhotos() {
    this.actions.printSelectedPhotos();
  }

  render() {
    return (
      <div className="selected-photos">
        {
          this.state.photos.map(photo =>
            <Photo
              photo={photo}
              width={260}
              key={photo.file_name}
            />,
          )
        }
        {this.state.printable ? <button onClick={this.printSelectedPhotos.bind(this)} className="print-button big-button">PRINT IT</button> : ''}
      </div>
    );
  }
}

SelectedPhotos.propTypes = {
  photos: React.PropTypes.arrayOf(
    React.PropTypes.shape(
      { file_name: React.PropTypes.string },
    ),
  ),
};

export default SelectedPhotos;
