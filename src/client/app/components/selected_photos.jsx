import React from 'react';
import BaseComponent from './base';
import Photo from './photo';


class SelectedPhotos extends BaseComponent {
  constructor() {
    super();
    this.state = this.getPhotoState();
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
    this.actions.loadPhotos();
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
              width={250}
              key={photo.file_name}
            />,
          )
        }
        {this.state.printable ? <button onClick={this.printSelectedPhotos.bind(this)} className="print-button">Print 'em!</button> : ''}
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
