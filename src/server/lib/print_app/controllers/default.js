const fs = require('fs');
const thenify = require('thenify');

const mimeHelper = require('../../mime_helper.js');
const printApp = require('../../print_app/index');


class DefaultController {
  constructor(params) {
    this.params = params;
    this.readFile = thenify(fs.readFile.bind(fs));
    this.printAppRender = thenify(printApp.render.bind(printApp, 'photo_strip'));
  }

  imgToBase64Url(imgPath) {
    const mimeType = mimeHelper.mimeType(imgPath);
    return this.readFile(imgPath)
      .then(data => `data:${mimeType};base64,${data.toString('base64')}`);
  }

  getTemplateString(params) {
    return this.printAppRender({ _locals: params });
  }

  getRenderParams() {
    const assetKeys = this.params.assetKeys || [];
    const renderParams = Object.assign({}, this.params);
    return Promise.all(assetKeys.map((imageKey) => {
      const imgPath = renderParams[imageKey];
      return this.imgToBase64Url(imgPath)
        .then((base64String) => {
          renderParams[imageKey] = base64String;
        });
    }))
      .then(() => renderParams);
  }

  render() {
    return this.getRenderParams()
      .then(params => this.getTemplateString(params));
  }
}

module.exports = DefaultController;
