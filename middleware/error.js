'use strict';

var debug = require('debug')('middleware:error');

/**
 * Express error handler which will be called if any
 * routes call next(err)
 *
 * @param  {Error}      err  Error
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
/*jshint -W098 */
function errors(err, req, res, next) {
  /*jshint +W098 */
  var data;

  debug(err.stack);

  if (process.env.NODE_ENV === 'development') {
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

  data.status = err.status || err.statusCode || 500;

  if (data.status === 500 && data.message === 'Failed to obtain access token') {
    data.status = 403;
  }

  res.status(data.status);

  if (/^\/v1/.test(req.url) && data.status !== 403) {
    res.json(data);
  } else {
    res.render('error', data);
  }
}

module.exports = errors;
