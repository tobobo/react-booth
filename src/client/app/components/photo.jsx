import React from 'react';
import BaseComponent from './base';

class Photo extends BaseComponent {
  constructor(props) {
    super();
    this.state = {
      photo: props.photo,
    };
  }

  render() {
    const fileName = this.state.photo.file_name;
    const filePath = `photos/thumbs/${fileName}`;
    return (
      <img width={this.props.width} alt={fileName} src={filePath} />
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
