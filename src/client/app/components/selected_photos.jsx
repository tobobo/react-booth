import React from 'react';
import BaseComponent from './base';
import Photo from './photo';


class SelectedPhotos extends BaseComponent {
  constructor() {
    super();
    this.state = { photos: this.getSelectedPhotos() };
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
    this.setState({ photos: this.getSelectedPhotos() });
  }

  render() {
    return (
      <div className="selected-photos">
        {
          this.state.photos.map(photo =>
            <Photo
              photo={photo}
              width={300}
              key={photo.file_name}
            />,
          )
        }
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
