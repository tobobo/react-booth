const cameraAdapter = require('./adapters/camera_adapter');
const imageConversionAdapter = require('./adapters/image_conversion_adapter');
const httpAdapter = require('./adapters/http_adapter');

cameraAdapter.runDownloadProcess();
imageConversionAdapter.watchPhotoDirectory();
httpAdapter.startServer();
