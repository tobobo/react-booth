const express = require('express');
const static = require('express-static');
const bodyParser = require('body-parser');
const fs = require('fs');
const exec = require('child_process').exec;
const _ = require('lodash');
const PHOTO_INTERVAL = 5000;
const PHOTO_DIR = 'photos';
const app = express();

function getPhotos(cb) {
  exec(`pushd ${PHOTO_DIR} && gphoto2 --get-all-files --new --skip-existing | grep Saving | wc -l && popd`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(`stdout: ${parseInt(stdout.match(/[0-9]+/))}`);
    if (stderr) console.log(`stderr: ${stderr}`);
    cb(error, stdout, stderr, parseInt(stdout.match(/[0-9]+/)));
  });
}

function getPhotosAtInterval() {
  getPhotos((error, stdout, stderr, numNewPhotos) => {
    console.log(`got ${numNewPhotos} photos`);
    setTimeout(getPhotosAtInterval, PHOTO_INTERVAL);
  });
}

getPhotosAtInterval();

app.use(bodyParser.json());


app.use(express.static('./src/client'));
app.use(`/${PHOTO_DIR}`, express.static(PHOTO_DIR));

app.listen(8000, () => console.log('listening'));

app.use('/api/photos/', (req, res) => {
  fs.readdir(`./${PHOTO_DIR}`, (err, files) => {
    let fileNameList = _.filter(files, (fileName) => fileName.match(/DSC/));
    fileList = _.map(fileNameList, (fileName) => ({ file_name: fileName }));
    res.json(fileList);
  });
})
