const fs = require('fs');
const _ = require('lodash');

const config = require('../../../config');
const imageConversionAdapter = require('./image_conversion_adapter');

const PHOTO_DIR = config.photoDir;

const fileSystemAdapter = {
  getPhotos() {
    return new Promise(resolve =>
      fs.readdir(`./${PHOTO_DIR}/thumbs`, (err, files) => {
        const fileNameList = files.filter(fileName => fileName.match(/\.jpg$/i));
        const fileList = fileNameList
          .reduce((memo, fileName) => {
            const convertingFile = _.find(
              imageConversionAdapter.convertingImages,
              image => image.match(fileName)
            );
            if (!convertingFile) memo.push(fileName);
            return memo;
          }, [])
          .map(fileName => ({ file_name: fileName }));
        resolve(fileList);
      })
    );
  },
};

module.exports = fileSystemAdapter;
