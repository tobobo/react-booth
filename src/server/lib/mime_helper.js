const mime = require('mime-types');

module.exports = {
  mimeType(path) {
    return mime.lookup(path) || 'application/octet-stream';
  },
};
