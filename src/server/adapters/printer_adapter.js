const printer = require('printer');
const path = require('path');
const _ = require('lodash');
const phantom = require('phantom');
const exec = require('child_process').exec;
const express = require('express');
const expressHandlebars = require('express-handlebars');

const config = require('../../../config');
const log = require('../lib/log_helper');

const SERVER_PORT = config.port;
const PHOTO_DIR = config.photoDir;
const OPEN_PREVIEW = config.openPreview;
const PRINT_FILE = config.printFile;
const BOTTOM_TEXTS = ['¡wicked!', '2017', '1622', 'nice duds', 'many thanks', 'we <3 isaac'];

const printApp = express();

const viewBase = path.join(__dirname, '../', 'views');
printApp.set('views', viewBase);
printApp.engine('.hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(viewBase, 'layouts'),
  partialsDir: path.join(viewBase, 'partials'),
}));
printApp.set('view engine', '.hbs');


const printerAdapter = {
  getPhantom: _.memoize(() => phantom.create()),

  printFile(filePath) {
    printer.printFile({
      filename: filePath,
      success: jobId => log(`queued ${filePath} with job ID ${jobId}`),
      error: log,
    });
  },

  print(photos) {
    const safePhotoFileNames = photos.map(photo =>
      ({ file_name: path.basename(photo.file_name) })
    );

    return Promise.all([
      this.getPhantom()
        .then(ph => ph.createPage())
        .then(page =>
          page
            .property('viewportSize', {
              width: 280,
              height: 800,
            })
            .then(() => page)
        ),
      new Promise((resolve, reject) =>
        printApp.render('print', {
          _locals: {
            photoBase: `http://localhost:${SERVER_PORT}/${PHOTO_DIR}/thumbs/`,
            photos: safePhotoFileNames,
            bottomText: BOTTOM_TEXTS[Math.floor(Math.random() * BOTTOM_TEXTS.length)],
          },
        }, (err, html) => {
          if (err) {
            log('err', err);
            reject(err);
          } else {
            resolve(html);
          }
        })
      ),
    ])
      .then(([page, photoTemplate]) => {
        const printSuffix = safePhotoFileNames
          .map(photo => photo.file_name.replace(/\..+$/, '').replace(' ', '_'))
          .join('_');
        const printPath = `prints/print_${printSuffix}.pdf`;
        return page.setContent(photoTemplate, 'localhost')
          .then(() => page.render(printPath))
          .then(() => { if (OPEN_PREVIEW) exec(`open ${printPath}`); })
          .then(() => { if (PRINT_FILE) this.printFile(printPath); })
          .then(() => path.basename(printPath));
      });
  },
};

module.exports = printerAdapter;
