import React from 'react';

class Photo extends React.Component {
  constructor(props) {
    super();
    this.state = { photo: props.photo };
  }

  render() {
    const fileName = this.state.photo.file_name;
    const filePath = `photos/${fileName}`;
    return (
      <img width={this.props.width} alt={fileName} src={filePath} key={fileName} />
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
