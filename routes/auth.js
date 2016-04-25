'use strict';

var express = require('express');
var passport = require('passport');
var router = express.Router();

function getLogin(req, res) {
  res.render('login', {
    user: req.user,
    json: JSON.stringify(req.user, null, 2)
  });
}

function getLogout(req, res) {
  req.logout();
  res.redirect('/');
}

/**
 * GET /shutterstock Use passport.authenticate() as route middleware
 * to authenticate the request.  The first step in Shutterstock
 * authentication will involve redirecting the user to
 * shutterstock.com.  After authorization, Shutterstockwill redirect
 * the user back to this routerlication at /shutterstock/callback
 *
 * [getShutterstock description]
 * @return {[type]} [description]
 */
function getShutterstock() {
  // The request will be redirected to Shutterstock for authentication,
  // so this function will not be called.
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
function getShutterstockCallback(req, res) {
  res.redirect('/v1/login');
}

router.get('/login', getLogin);
router.get('/logout', getLogout);
router.get('/shutterstock', passport.authenticate('shutterstock'), getShutterstock);
router.get('/shutterstock/callback', passport.authenticate('shutterstock', {
  failureRedirect: '/v1/login'
}), getShutterstockCallback);

module.exports.getLogin = getLogin;
module.exports.getLogout = getLogout;
module.exports.getShutterstock = getShutterstock;
module.exports.getShutterstockCallback = getShutterstockCallback;

module.exports.router = router;
