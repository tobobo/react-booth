const printer = require('printer');
const path = require('path');
const _ = require('lodash');
const phantom = require('phantom');
const exec = require('child_process').exec;

const config = require('../../../config');
const log = require('../lib/log_helper');
const DefaultController = require('../lib/print_app/controllers/default');

const SERVER_PORT = config.port;
const PHOTO_DIR = config.photoDir;
const OPEN_PREVIEW = config.openPreview;
const PRINT_FILE = config.printFile;
const BOTTOM_TEXTS = ['¡wicked!', '2017', '1622', 'nice duds', 'many thanks', 'we <3 isaac'];
// const BOTTOM_IMAGES =

const printerAdapter = {
  getPhantom: _.memoize(() => phantom.create()),

  printFile(filePath) {
    printer.printFile({
      filename: filePath,
      success: jobId => log(`queued ${filePath} with job ID ${jobId}`),
      error: log,
    });
  },

  createPhantomPage() {
    return this.getPhantom()
      .then(ph => ph.createPage())
      .then(page =>
        page
          .property('viewportSize', {
            width: 280,
            height: 800,
          })
          .then(() => page)
      );
  },

  generatePageHtml(photoFileNames) {
    return new DefaultController({
      photoBase: `http://localhost:${SERVER_PORT}/${PHOTO_DIR}/thumbs/`,
      photos: photoFileNames,
      bottomText: BOTTOM_TEXTS[Math.floor(Math.random() * BOTTOM_TEXTS.length)],
      bottomImage: path.join(__dirname, '../lib/print_app/assets/change_logo_bw.gif'),
      assetKeys: ['bottomImage'],
    })
      .render();
  },

  generatePdf(page, pageHtml, photoFileNames) {
    const printSuffix = photoFileNames
      .map(photo => photo.file_name.replace(/\..+$/, '').replace(' ', '_'))
      .join('_');
    const printPath = `prints/print_${printSuffix}.pdf`;
    return page.setContent(pageHtml, 'localhost')
      .then(() => page.render(printPath))
      .then(() => printPath);
  },

  presentPdf(pdfPath) {
    if (OPEN_PREVIEW) exec(`open ${pdfPath}`);
    if (PRINT_FILE) this.printFile(pdfPath);
  },

  print(photos) {
    const safePhotoFileNames = photos.map(photo =>
      ({ file_name: path.basename(photo.file_name) })
    );
    return Promise.all([
      this.createPhantomPage(),
      this.generatePageHtml(safePhotoFileNames),
    ])
      .then(([page, pageHtml]) =>
        this.generatePdf(page, pageHtml, safePhotoFileNames)
          .then((pdfPath) => {
            this.presentPdf(pdfPath);
            return path.basename(pdfPath);
          })
      );
  },
};

module.exports = printerAdapter;
