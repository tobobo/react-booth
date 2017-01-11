const gaze = require('gaze');
const im = require('imagemagick');
const path = require('path');

const config = require('../../../config.js');
const log = require('../lib/log_helper');

const PHOTO_DIR = config.photoDir;

const imageConversionAdapter = {
  convertingImages: [],

  convertImage(filePath) {
    log('resizing', filePath);
    const basename = path.basename(filePath);
    this.convertingImages.push(basename);
    im.convert([
      filePath,
      '-resize', '800x800',
      '-level', '15%,65%,0.5',
      '-modulate', '100,0',
      filePath.replace(PHOTO_DIR, `${PHOTO_DIR}/thumbs`),
    ], (convertErr) => {
      this.convertingImages = this.convertingImages.reduce((memo, convertingImage) => {
        if (basename !== convertingImage) memo.push(basename);
        return memo;
      }, []);
      if (convertErr) log('resizing error', convertErr);
      log('resized', filePath);
    });
  },

  watchPhotoDirectory(photoCallback) {
    gaze(['*.jpg', '*.JPG'], { cwd: 'photos' }, (err, watcher) => {
      watcher.on('added', (filePath) => {
        this.convertImage(filePath);
        photoCallback(filePath);
      });
    });
  },
};

module.exports = imageConversionAdapter;
