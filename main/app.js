require('rootpath')();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const errorHandler = require('main/_helpers/error-handler');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// api routes
app.use('/api', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

module.exports = app;
