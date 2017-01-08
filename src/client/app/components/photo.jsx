import React from 'react';
import BaseComponent from './base';

class Photo extends BaseComponent {
  constructor(props) {
    super();
    this.selectable = props.selectable !== false;
    this.state = {
      photo: props.photo,
      selected: false,
    };
  }

  selectPhoto() {
    if (this.state.selected || !this.selectable) return;
    this.actions.selectPhoto(this.state.photo);
    this.setState({ selected: true });
  }

  render() {
    const fileName = this.state.photo.file_name;
    const filePath = `photos/${fileName}`;
    return (
      <button onMouseDown={this.selectPhoto.bind(this)} className={`photo-button ${this.state.selected ? 'selected' : ''}`}>
        <img width={this.props.width} alt={fileName} src={filePath} />
      </button>
    );
  }
}

Photo.propTypes = {
  width: React.PropTypes.number,
  photo: React.PropTypes.shape({
    file_name: React.PropTypes.string,
  }),
};

export default Photo;
