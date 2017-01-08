import React from 'react';

class Photo extends React.Component {
  constructor(props) {
    super();
    this.state = { photo: props.photo };
  }

  selectPhoto() {
    console.log('photo', this.state.photo);
  }

  render() {
    const fileName = this.state.photo.file_name;
    const filePath = `photos/${fileName}`;
    return (
      <button onClick={this.selectPhoto.bind(this)} className="photo-button">
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
