const nodemon = require('nodemon');
const webpack = require('webpack');

// eslint-disable-next-line no-console
const log = (...args) => console.log('!!!', ...args);

nodemon({
  script: './src/server/index.js',
  watch: ['./src/server', './config.js', './index.js'],
  ext: 'js json hbs',
});

const webpackCompiler = webpack(require('./webpack.config'), (err) => {
  if (err) log('webpack error', err);
});

webpackCompiler.watch({}, (err, stats) => {
  if (err) log('webpack watch error', err);
  if (stats) log('webpack stats', stats.toString());
});
