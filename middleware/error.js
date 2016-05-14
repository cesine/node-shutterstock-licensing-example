'use strict';

var debug = require('debug')('middleware:error');

/*jshint -W098 */
function errors(err, req, res, next) {
  /*jshint +W098 */
  var data;

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

  res.status(data.status);

  if (/^\/v1/.test(req.url)) {
    res.json(data);
  } else {
    res.render('error', data);
  }
}

module.exports = errors;
