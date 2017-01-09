const nodemon = require('nodemon');
const webpack = require('webpack');

const log = (...args) => console.log('!!!', ...args);

nodemon({
  script: './src/server/index.js',
  watch: './src/server',
  ext: 'js json hbs',
});

const webpackCompiler = webpack(require('./webpack.config'), (err) => {
  if (err) log('webpack error', err);
});

webpackCompiler.watch({}, (err) => {
  if (err) log('webpack watch error', err);
});
