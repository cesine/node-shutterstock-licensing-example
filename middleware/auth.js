'use strict';

var debug = require('debug')('middleware:auth');
var passport = require('passport');
var Sequelize = require('sequelize');
var ShutterstockStrategy = require('passport-shutterstock-oauth2').Strategy;

var SHUTTERSTOCK_CLIENT_ID = process.env.SHUTTERSTOCK_CLIENT_ID ||
  '--insert-shutterstock-client-id-here--';
var SHUTTERSTOCK_CLIENT_SECRET = process.env.SHUTTERSTOCK_CLIENT_SECRET ||
  '--insert-shutterstock-client-secret-here--';
var URL = process.env.URL || 'http://localhost:' + process.env.PORT;

var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: 'db.sqlite'
});

var User = sequelize.define('users', {
  givenName: Sequelize.STRING,
  language: Sequelize.STRING,
  username: Sequelize.STRING
});

/**
 * Passport session setup. To support persistent login sessions,
 * Passport needs to be able to serialize users into and deserialize
 * users out of the session.  Typically, this will be as simple as
 * storing the user ID when serializing, and finding the user by ID
 * when deserializing.
 *
 */
passport.serializeUser(function(profile, callback) {
  debug('serializeUser ' + profile.username);
  if (!profile || !profile.name) {
    return callback(new Error('User profile must have `name` property'));
  }

  if (profile && profile.name && !profile.name.givenName) {
    profile.name.givenName = profile.username;
  }

  function create() {
    return User.create({
      givenName: profile.name.givenName,
      language: profile.language,
      username: profile.username,
    }).then(function(saved) {
      debug(saved);

      return callback(null, profile.username);
    }, callback);
  }

  sequelize.sync().then(function() {
    return User.find({
      where: {
        username: profile.username
      }
    }).then(function(dbUser) {
      // Create the user
      if (!dbUser) {
        return create();
      }

      // Update the user from the provider
      dbUser.language = profile.language;
      dbUser.givenName = profile.name.givenName;

      return dbUser.save().then(function(saved) {
        debug(saved);

        return callback(null, profile.username);
      }, callback);
    }, function(err) {
      debug(err);

      // Create the user
      create();
    });
  }, callback);
});

passport.deserializeUser(function(username, callback) {
  debug('deserializeUser ' + username);

  sequelize.sync()
    .then(function() {
      return User.findOne({
        where: {
          username: username
        }
      }).then(function(user) {
        if (!user) {
          debug('Unable to find the user ' + username);
          return callback(null, null);
        }

        callback(null, user.toJSON());
      }, callback);
    }, callback);
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
    callbackURL: URL + '/v1/auth/login/shutterstock/callback',
    scope: ['licenses.create', 'licenses.view', 'purchases.view', 'user.view']
  },
  function(accessToken, refreshToken, profile, callback) {
    // asynchronous verification, for effect...
    process.nextTick(function() {
      profile.token = accessToken;
      debug(profile);
      // To keep the example simple, the user's Shutterstock profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Shutterstock account with a user record in your database,
      // and return that user instead.
      return callback(null, profile);
    });
  }
));

function auth(req, res, next) {
  req.authenticated = false;

  // if (req.session && req.session.error) {
  //   var msg = req.session.error;
  //   req.session.error = undefined;
  //   // TODO why is this poluting the app?
  //   req.app.locals.errorMessage = msg;
  // } else {
  //   // TODO why is this poluting the app?
  //   req.app.locals.errorMessage = undefined;
  // }

  next();
}

module.exports = auth;
