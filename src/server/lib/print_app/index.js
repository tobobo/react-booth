const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');

const printApp = express();

const viewBase = path.join(__dirname, 'views');
printApp.set('views', viewBase);
printApp.engine('.hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(viewBase, 'layouts'),
  partialsDir: path.join(viewBase, 'partials'),
}));
printApp.set('view engine', '.hbs');

module.exports = printApp;
