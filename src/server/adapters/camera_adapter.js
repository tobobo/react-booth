const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

const log = require('../lib/log_helper');
const config = require('../../../config');
const timeHelpers = require('../../lib/time_helpers');

const KILL_PTPCAMERA = config.killPtpCamera;
const RETRY_PHOTO_DOWNLOAD = config.retryPhotoDownload;
const PHOTO_DIR = config.photoDir;

const cameraAdapter = {
  capturing: false,
  downloadProcess: undefined,

  runDownloadProcess() {
    if (this.capturing) return;
    log('setting up auto download');
    new Promise((resolve) => {
      if (!KILL_PTPCAMERA) {
        resolve();
        return;
      }
      log('killing PTPCamera');
      exec('killall PTPCamera', () => resolve());
    })
      .then(() => {
        this.downloadProcess = spawn('gphoto2', ['--capture-tethered'], {
          cwd: `./${PHOTO_DIR}`,
        });
        log('spawned camera process');
        this.downloadProcess.stdout.pipe(process.stdout);
        this.downloadProcess.stderr.pipe(process.stderr);
        this.downloadProcess.stderr.on('data', (data) => {
          const dataString = data.toString();
          if (dataString.match(/error/i)) {
            if (this.downloadProcess) this.downloadProcess.kill();
            this.downloadProcess = undefined;
            if (RETRY_PHOTO_DOWNLOAD) {
              log('retrying photo process in 5 seconds');
              setTimeout(() => this.runDownloadProcess(), 5000);
            }
          }
        });
      });
  },

  capture() {
    if (this.capturing) return;
    if (this.downloadProcess) this.downloadProcess.kill();
    this.capturing = true;
    setTimeout(() => {
      exec(`cd photos && gphoto2 --capture-image-and-download -F 4 -I 2 --filename ${timeHelpers.getUnixTime()}_capture_%n.JPG`, () => {
        this.capturing = false;
        this.runDownloadProcess();
      });
    }, 1000);
  },
};

module.exports = cameraAdapter;
