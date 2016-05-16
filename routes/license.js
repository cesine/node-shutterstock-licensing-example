'use strict';

var express = require('express');
var passport = require('passport');
var debug = require('debug')('route:license');
var router = express.Router();

/**
 * If the request is authenticated (typically via a persistent login session),
 * the request will proceed.
 *
 * Otherwise, the user will be redirected to
 * the login page.
 *
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
var licenseImage = function(req, res, next) {
  if (!req.isAuthenticated() || !req.session || !req.session.token) {
    debug('unauthorized, redirecting to login');
    return res.redirect('/v1/auth/login/shutterstock?next=' + req.url);
  }

  if (!req.query || !req.query.subscriptionId) {
    return next(new Error('Subscription ID is required'));
  }

  var options = {
    url: 'https://api.shutterstock.com/v2/images/licenses?subscription_id=' + req.query.subscriptionId,
    method: 'POST',
    data: {
      images: [{
        image_id: req.params.imageId,
      }]
    },
    headers: {
      Authorization: 'Bearer ' + req.session.token,
      'Content-Type': 'application/json',
    }
  };
  debug('licensing', options);

  passport.shutterstock._oauth2._request(
    options.method,
    options.url,
    options.headers,
    JSON.stringify(options.data),
    null,
    function(err, body) {
      var json;

      if (err) {
        next(err)
      }

      try {
        json = JSON.parse(body);
      } catch (ex) {
        return next(ex);
      }

      debug('licensed', json);
      res.json(json);
    });
};

/**
 *  Get a list of a user's licenses
 *
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
var list = function(req, res, next) {
  if (!req.isAuthenticated() || !req.session || !req.session.token) {
    return res.redirect('/v1/auth/login/shutterstock?next=' + req.url);
  }

  var options = {
    token: req.session.token,
    url: 'https://api.shutterstock.com/v2/images/licenses'
  }
  debug('requesting licenses', options);

  passport.shutterstock._oauth2.get(
    options.url,
    options.token,
    function(err, body) {
      var json;

      if (err) {
        debug(err)
        return next(new Error('Failed to fetch your licenses', err));
      }

      try {
        json = JSON.parse(body);
      } catch (ex) {

        debug(ex);
        return next(new Error('Failed to parse licenses'));
      }

      debug('licenses', json);
      res.json(json);
    });
};

router.get('/images/:imageId', licenseImage);
router.post('/images/:imageId', licenseImage);
router.get('/', list);

module.exports.licenseImage = licenseImage;
module.exports.list = list;

module.exports.router = router;
