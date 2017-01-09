import React from 'react';
import BaseComponent from './base';
import Photo from './photo';

const NUM_LARGE_PHOTOS = 0;
const NUM_SMALL_PHOTOS = 64;
const SMALL_WIDTH = 240;
const LARGE_WIDTH = 600;

export default class PreviewPhotos extends BaseComponent {
  constructor() {
    super();
    this.photoRemovedListener = this.onPhotoRemoved.bind(this);
    this.state = {
      photos: this.photoStore.getAll(),
    };
  }

  componentDidMount() {
    this.photoStore.addPhotoChangeListener(this.changeListener);
    this.photoStore.addSelectedPhotoRemovedListener(this.photoRemovedListener);
  }

  componentWillUnmount() {
    this.photoStore.removePhotoChangeListener(this.changeListener);
    this.photoStore.removeSelectedPhotoRemovedListener(this.photoRemovedListener);
  }

  togglePhotoSelection(photo) {
    if (photo.selected) {
      this.deselectPhoto(photo);
    } else {
      this.selectPhoto(photo);
    }
  }

  selectPhoto(photo) {
    const selectedPhoto = photo;
    selectedPhoto.selected = true;
    this.actions.selectPhoto(selectedPhoto);
    this.setState({ photos: this.state.photos });
  }

  deselectPhoto(photo) {
    const deselectedPhoto = photo;
    deselectedPhoto.selected = false;
    this.actions.deselectPhoto(deselectedPhoto);
    this.setState({ photo: this.state.photos });
  }

  onPhotoRemoved(removedPhoto) {
    const deselectedPhoto = this.state.photos.find(
      photo => photo.file_name === removedPhoto.file_name,
    );
    if (deselectedPhoto) deselectedPhoto.selected = false;
    this.setState({ photos: this.state.photos });
  }

  onChange() {
    this.setState({ photos: this.photoStore.getAll().reverse() });
    setTimeout(() => this.actions.loadPhotos(), 750);
  }

  render() {
    const photos = this.state.photos.slice(0, NUM_LARGE_PHOTOS + NUM_SMALL_PHOTOS);
    const hasSelectedPhotos = photos.find(photo => photo.selected === true);
    return (
      <div className={`preview-photos ${hasSelectedPhotos ? 'has-selected' : ''}`}>
        <p className="select-instructions">
          select {this.photoStore.maxSelectedPhotos} photos
        </p>
        {
          photos.map((photo, i) =>
            <span key={photo.file_name}>
              <button
                onMouseDown={this.togglePhotoSelection.bind(this, photo)}
                className={`photo-button ${photo.selected ? 'selected' : ''}`}
              >
                <Photo
                  photo={photo}
                  width={i >= NUM_LARGE_PHOTOS ? SMALL_WIDTH : LARGE_WIDTH}
                />
              </button>
              <span>{i === NUM_LARGE_PHOTOS - 1 ? <br /> : ''}</span>
            </span>,
          )
        }
      </div>
    );
  }
}
