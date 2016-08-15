'use strict';

var debug = require('debug')('passport:route:auth');
var express = require('express');
var passport = require('passport');
var router = express.Router();

/**
 * Render the login page, if the user is not already logged in
 *
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
function getLogin(req, res) {
  var finalDestination = req.query ? req.query.next : '';

  /* provided by passport */
  if (req.isAuthenticated()) {
    return res.redirect(finalDestination || '/');
  }

  if (finalDestination) {
    finalDestination = '?next=' + finalDestination;
  } else{
    finalDestination = '';
  }

  debug('will redirect to ' + finalDestination);
  res.redirect('/v1/auth/login/shutterstock' + finalDestination);
}

/**
 * Logout the user and redirect them to the next page or root
 *
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
function getLogout(req, res) {
  /* provided by passport */
  req.logout();

  res.redirect(req.query ? req.query.next : '/');
}

/**
 * GET /shutterstock Use passport.authenticate() as route middleware
 * to authenticate the request.  The first step in Shutterstock
 * authentication will involve redirecting the user to
 * shutterstock.com.  After authorization, Shutterstock will redirect
 * the user back to this router location at /shutterstock/callback
 *
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
function getShutterstock(req, res, next) {
  var finalDestination = '/';
  if (req.query && req.query.next) {
    finalDestination = req.query.next;
  }

  /* provided by passport */
  if (req.isAuthenticated()) {
    return res.redirect(finalDestination);
  }

  /*jshint -W098 */
  passport.authenticate('shutterstock', function(err, user, info) {
    /*jshint +W098 */
    debug('getShutterstock', arguments);

    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/v1/auth/login');
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect(finalDestination);
    });
  })(req, res, next);
}

/**
 * GET /shutterstock/callback Use passport.authenticate() as route
 * middleware to authenticate the request.  If authentication fails,
 * the user will be redirected back to the login page.  Otherwise, the
 * primary route function function will be called, which, in this
 * example, will redirect the user to the home page.
 *
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
function getShutterstockCallback(req, res, next) {
  var finalDestination = req.query.next || req.params.next || '/';
  /*jshint -W098 */
  passport.authenticate('shutterstock', function(err, user, info) {
    /*jshint +W098 */
    debug('getShutterstockCallback', arguments);

    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/v1/auth/login');
    }

    // retain the token for subsequent requests to the API in this session
    req.session.token = user.token;
    debug('session', req.session);

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect(finalDestination);
    });
  })(req, res, next);
}

router.get('/login', getLogin);
router.get('/logout', getLogout);
router.get('/login/shutterstock', getShutterstock);
router.get('/login/shutterstock/callback/:next', getShutterstockCallback);
router.get('/login/shutterstock/callback', getShutterstockCallback);

module.exports.getLogin = getLogin;
module.exports.getLogout = getLogout;
module.exports.getShutterstock = getShutterstock;
module.exports.getShutterstockCallback = getShutterstockCallback;

module.exports.router = router;
