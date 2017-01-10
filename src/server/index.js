const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const phantom = require('phantom');
const exphbs = require('express-handlebars');
const path = require('path');
const _ = require('lodash');
const gaze = require('gaze');
const im = require('imagemagick');
const printer = require('printer');

// eslint-disable-next-line no-console
const log = (...args) => console.log('***', ...args);

const PHOTO_DIR = 'photos';

const SERVER_PORT = 8000;

const RETRY_PHOTO_CAPTURE = false;
const KILL_PTPCAMERA = true;
const OPEN_PREVIEW = true;
const PRINT_FILE = false;

const BOTTOM_TEXTS = ['¡wicked!', '2017', '1622', 'nice duds', 'many thanks', 'we <3 isaac'];

const app = express();
const httpServer = http.Server(app);
const io = socketIo(httpServer);

const viewBase = path.join(__dirname, 'views');
app.set('views', viewBase);
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(viewBase, 'layouts'),
  partialsDir: path.join(viewBase, 'partials'),
}));
app.set('view engine', '.hbs');

const getPhantom = _.memoize(() => phantom.create());

function runPhotoProcess() {
  new Promise((resolve) => {
    if (!KILL_PTPCAMERA) {
      resolve();
      return;
    }
    exec('killall PTPCamera', () => resolve());
  })
    .then(() => {
      const captureProcess = spawn('gphoto2', ['--capture-tethered'], {
        cwd: `./${PHOTO_DIR}`,
      });
      captureProcess.stdout.pipe(process.stdout);
      captureProcess.stderr.pipe(process.stderr);
      captureProcess.stderr.on('data', (data) => {
        const dataString = data.toString();
        if (dataString.match(/error/i)) {
          captureProcess.kill();
          if (RETRY_PHOTO_CAPTURE) {
            setTimeout(runPhotoProcess, 5000);
          }
        }
      });
    });
}

runPhotoProcess();

let convertingImages = [];

gaze(['*.jpg', '*.JPG'], { cwd: 'photos' }, (err, watcher) => {
  watcher.on('added', (filePath) => {
    log('resizing', filePath);
    const basename = path.basename(filePath);
    convertingImages.push(basename);
    im.convert([
      filePath,
      '-resize', '800x800',
      '-level', '15%,65%,0.5',
      '-modulate', '100,0',
      filePath.replace(PHOTO_DIR, `${PHOTO_DIR}/thumbs`),
    ], (convertErr) => {
      convertingImages = convertingImages.reduce((memo, convertingImage) => {
        if (basename !== convertingImage) memo.push(basename);
        return memo;
      }, []);
      if (convertErr) log('resizing error', convertErr);
      log('resized', filePath);
      io.emit('photo', { file_name: path.basename(filePath) });
    });
  });
});

function printFile(filePath) {
  printer.printFile({
    filename: filePath,
    success: jobId => log(`queued ${filePath} with job ID ${jobId}`),
    error: log,
  });
}

app.use(bodyParser.json());

app.use(express.static('./src/client'));
app.use(`/${PHOTO_DIR}`, express.static(PHOTO_DIR));

function getPhotos() {
  return new Promise(resolve =>
    fs.readdir(`./${PHOTO_DIR}/thumbs`, (err, files) => {
      const fileNameList = files.filter(fileName => fileName.match(/\.jpg$/i));
      const fileList = fileNameList
        .reduce((memo, fileName) => {
          const convertingFile = _.find(convertingImages, image => image.match(fileName));
          if (!convertingFile) memo.push(fileName);
          return memo;
        }, [])
        .map(fileName => ({ file_name: fileName }));
      resolve(fileList);
    })
  );
}

app.get('/api/photos/', (req, res) => {
  getPhotos().then(photos => res.json(photos));
});

function print(photos) {
  const safePhotoFileNames = photos.map(photo =>
    ({ file_name: path.basename(photo.file_name) })
  );

  return Promise.all([
    getPhantom()
      .then(ph => ph.createPage())
      .then(page =>
        page
          .property('viewportSize', {
            width: 620,
            height: 800,
          })
          .then(() => page)
      ),
    new Promise((resolve, reject) =>
      app.render('print', {
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
        .then(() => { if (PRINT_FILE) printFile(printPath); })
        .then(() => path.basename(printPath));
    });
}

app.post('/api/print', (req, res) => {
  print(req.body.photos)
    .then(printName => res.json({ print_path: printName }))
    .catch(res.send);
});

io.on('connection', (socket) => {
  getPhotos().then(photos => socket.emit('photos', photos));
  socket.on('print', (photos) => {
    print(photos)
      .then(printName => socket.emit('print_queued', { print_name: printName }));
  });
});

httpServer.listen(SERVER_PORT, () => log(`listening on ${SERVER_PORT}`));
