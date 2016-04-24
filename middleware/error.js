'use strict';
var debug = require('debug')('middleware:error');

function errors(err, req, res, next) {
  var data;
  var help;

  debug(req.app.locals);
  debug(err.stack);

  if (req.app.locals.ENV === 'dev') {
    // expose stack traces
    data = {
      message: err.message,
      error: err
    };
  } else {
    // production error handler
    data = {
      message: err.message,
      error: {}
    };
  }

  data.status = err.status || 500;

  res.status(err.status);

  if (/^\/v1/.test(req.url)) {
    res.json(data);
  } else {
    res.render('error', data);
  }
}

module.exports = errors;
