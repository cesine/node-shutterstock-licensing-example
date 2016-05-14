'use strict';

var debug = require('debug')('auth');
var express = require('express');
var passport = require('passport');
var router = express.Router();

function isAuthenticated(req) {
  if (!req.isAuthenticated()) {
    return false;
  } else {
    return true;
  }
}

function isInRole(role) {
  return function(req) {
    if (req.isAuthenticated() && req.user.roles.indexOf(role) > -1) {
      return true;
    } else {
      return false;
    }
  };
}

function getAdmin(req, res, next) {
  if (!isInRole('admin')(req, res, next)) {
    req.session.error = 'You are not authorized!';
    res.redirect('/');
    return;
  }

  next();
}

function getLogin(req, res) {
  res.render('login', {
    user: req.user,
    json: JSON.stringify(req.user, null, 2)
  });

  // var auth = passport.authenticate('local', function(err, user) {
  //   if (err) return next(err);

  //   if (!user) {
  //     req.session.error = 'Invalid Username or Password!';
  //     res.redirect('/login');
  //   }

  //   req.logIn(user, function(err) {
  //     if (err) return next(err);
  //     res.redirect('/');
  //   })
  // });

  // auth(req, res, next);
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
function getShutterstock(req, res, next) {
  passport.authenticate('shutterstock', function(err, user, info) {
    debug(arguments)
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
    debug(arguments)
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

router.get('/admin', getAdmin);
router.get('/login', getLogin);
router.get('/logout', getLogout);
router.get('/shutterstock', getShutterstock);
router.get('/shutterstock/callback', getShutterstockCallback);

module.exports.getAdmin = getAdmin;
module.exports.getLogin = getLogin;
module.exports.getLogout = getLogout;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isInRole = isInRole;
module.exports.getShutterstock = getShutterstock;
module.exports.getShutterstockCallback = getShutterstockCallback;

module.exports.router = router;
