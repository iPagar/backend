// load env
require('dotenv').config();
// express
const express = require('express');
// cors and fs
const cors = require('cors');
const http = require('http');
// securing
const helmet = require('helmet');
const check = require('vkui-sign-checker');
// loggers and error handlers
const createError = require('http-errors');
const winston = require('./config/winston');
const { notFoundHandler, errorHanlder } = require('./config/errorHandlers');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  express.urlencoded({ limit: '1mb', parameterLimit: 500, extended: true })
);
app.use(cors());
app.use(winston);
app.disable('x-powered-by');

// check sign
app.use(async (req, res, next) => {
  const xSignHeader = req.headers[`x-sign-header`].slice(1);
  try {
    const params = await check(xSignHeader, process.env.VK_SECURE_MODULI);
    req.body = { params, ...req.body };
    next();
  } catch (_e) {
    try {
      const params = await check(xSignHeader, process.env.VK_SECURE_SCHEDULE);
      req.body = { params, ...req.body };
      next();
    } catch (_e1) {
      next(createError(401));
    }
  }
});

// modules
const manage = require('./routes/manage');
const schedule = require('./routes/schedule');
const teachers = require('./routes/teachers');
const ol = require('./routes/ol');

app.use([manage, schedule, teachers, ol]);

// error handlers
app.use(notFoundHandler);
app.use(errorHanlder);

http.createServer(app).listen(process.env.PORT);
