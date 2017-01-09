const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const phantom = require('phantom');
const exphbs = require('express-handlebars');
const path = require('path');
const _ = require('lodash');

const PHOTO_DIR = 'photos';
const SERVER_PORT = 8000;
const OPEN_PRINT = true;

const app = express();

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

function getPhotos() {
  const captureProcess = spawn('gphoto2', ['--capture-tethered'], {
    cwd: `./${PHOTO_DIR}`,
  });
  captureProcess.stdout.pipe(process.stdout);
  captureProcess.stderr.pipe(process.stderr);
}

getPhotos();

app.use(bodyParser.json());

app.use(express.static('./src/client'));
app.use(`/${PHOTO_DIR}`, express.static(PHOTO_DIR));

app.get('/api/photos/', (req, res) => {
  fs.readdir(`./${PHOTO_DIR}`, (err, files) => {
    const fileNameList = _.filter(files, fileName => fileName.match(/DSC/));
    const fileList = _.map(fileNameList, fileName => ({ file_name: fileName }));
    res.json(fileList);
  });
});

app.post('/api/print', (req, res) => {
  Promise.all([
    getPhantom()
      .then(ph => ph.createPage())
      .then(page =>
        page
          .property('viewportSize', {
            width: 300,
            height: 900,
          })
          .then(() => page)
      ),
    new Promise((resolve, reject) =>
      app.render('print', {
        _locals: {
          photoBase: `http://localhost:${SERVER_PORT}/photos/`,
          photos: req.body.photos,
          bottomText: '¡wicked!',
        },
      }, (err, html) => {
        if (err) {
          console.log('err', err);
          reject(err);
        } else {
          resolve(html);
        }
      })
    ),
  ])
    .then(([page, photoTemplate]) => {
      const printPath = `prints/print_${Math.round(Date.now() / 1000)}.pdf`;
      return page.setContent(photoTemplate, 'localhost')
        .then(() => page.render(printPath))
        .then(() => { if (OPEN_PRINT) exec(`open ${printPath}`); })
        .then(() => res.json({ print_path: printPath }))
        .catch(console.log);
    })
    .catch(res.send);
});

app.listen(SERVER_PORT, () => console.log(`listening on ${SERVER_PORT}`));
