'use strict';

var debug = require('debug')('passport:route:auth');
var express = require('express');
var passport = require('passport');
var router = express.Router();

function getLogin(req, res) {
  /* provided by passport */
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  res.render('login', {});
}

function getLogout(req, res) {
  /* provided by passport */
  req.logout();

  res.redirect('/');
}

/**
 * GET /shutterstock Use passport.authenticate() as route middleware
 * to authenticate the request.  The first step in Shutterstock
 * authentication will involve redirecting the user to
 * shutterstock.com.  After authorization, Shutterstockwill redirect
 * the user back to this router location at /shutterstock/callback
 *
 * [getShutterstock description]
 * @return {[type]} [description]
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

  passport.authenticate('shutterstock', function(err, user, info) {
    debug(arguments);

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
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function getShutterstockCallback(req, res, next) {
  passport.authenticate('shutterstock', function(err, user, info) {
    debug(arguments);

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
      return res.redirect('/');
    });
  })(req, res, next);
}

router.get('/login', getLogin);
router.get('/logout', getLogout);
router.get('/login/shutterstock', getShutterstock);
router.get('/login/shutterstock/callback', getShutterstockCallback);

module.exports.getLogin = getLogin;
module.exports.getLogout = getLogout;
module.exports.getShutterstock = getShutterstock;
module.exports.getShutterstockCallback = getShutterstockCallback;

module.exports.router = router;
