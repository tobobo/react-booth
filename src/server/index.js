const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const spawn = require('child_process').spawn;
const _ = require('lodash');

const PHOTO_DIR = 'photos';

const app = express();

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
  console.log('photos', req.body.photos);
  res.json({});
});

app.listen(8000, () => console.log('listening'));
