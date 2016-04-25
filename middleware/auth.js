'use strict';

var debug = require('debug')('middleware:auth');
var passport = require('passport');
var ShutterstockStrategy = require('passport-shutterstock-oauth2').Strategy;

var SHUTTERSTOCK_CLIENT_ID = process.env.SHUTTERSTOCK_CLIENT_ID ||
  '--insert-shutterstock-client-id-here--';
var SHUTTERSTOCK_CLIENT_SECRET = process.env.SHUTTERSTOCK_CLIENT_SECRET ||
  '--insert-shutterstock-client-secret-here--';
var URL = process.env.URL || 'http://localhost:' + process.env.PORT;

/**
 * Passport session setup. To support persistent login sessions,
 * Passport needs to be able to serialize users into and deserialize
 * users out of the session.  Typically, this will be as simple as
 * storing the user ID when serializing, and finding the user by ID
 * when deserializing.  However, since this example does not have a
 * database of user records, the complete Shutterstock profile is
 * serialized and deserialized.
 */
passport.serializeUser(function(user, done) {
  debug('serializeUser ' + user.username);
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  debug('deserializeUser ' + username);
  done(null, {
    username: username
  });
});

/**
 * Use the ShutterstockStrategy within Passport. Strategies in Passport
 * require a `verify` function, which accept credentials (in this case,
 * an accessToken, refreshToken, and Shutterstock profile), and invoke
 * a callback with a user object.
 */
passport.use(new ShutterstockStrategy({
    clientID: SHUTTERSTOCK_CLIENT_ID,
    clientSecret: SHUTTERSTOCK_CLIENT_SECRET,
    callbackURL: URL + '/v1/auth/shutterstock/callback',
    scope: ['licenses.create', 'licenses.view', 'purchases.view', 'user.view']
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {
      debug(profile);
      // To keep the example simple, the user's Shutterstock profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Shutterstock account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

function auth(req, res, next) {
  req.authenticated = false;

  next();
}

module.exports = auth;
