const createError = require('http-errors');
const winston = require('./winston');

// error handler 404
const notFoundHandler = (req, res, next) => {
  next(createError(404, 'Not Found'));
};

// error handler
const errorHanlder = (err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`
  );

  // render the error page
  res.status(err.status || 500);
  res.json({ status: err.status, message: err.message });
};

module.exports = { notFoundHandler, errorHanlder };
