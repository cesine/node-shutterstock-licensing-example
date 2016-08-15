'use strict';

var debug = require('debug')('passport:middleware:auth');
var passport = require('passport');
var Sequelize = require('sequelize');
var ShutterstockStrategy = require('passport-shutterstock-oauth2').Strategy;

var SHUTTERSTOCK_CLIENT_ID = process.env.SHUTTERSTOCK_CLIENT_ID ||
  '--insert-shutterstock-client-id-here--';
var SHUTTERSTOCK_CLIENT_SECRET = process.env.SHUTTERSTOCK_CLIENT_SECRET ||
  '--insert-shutterstock-client-secret-here--';
var URL = process.env.URL || 'https://localhost:' + process.env.PORT;

/**
 * Use sequelize to create a database to store users
 */
var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: 'db.sqlite'
});

/**
 * User Schema
 * (add other fields if you wish to keep, this keeps the bare minimum)
 */
var User = sequelize.define('users', {
  givenName: Sequelize.STRING,
  language: Sequelize.STRING,
  username: Sequelize.STRING
});

/**
 * Passport session setup. To support persistent login sessions,
 * Passport needs to be able to serialize users into and deserialize
 * users out of the session.
 */
passport.serializeUser(function(profile, callback) {
  debug('serializeUser ');
  if (!profile || !profile.name) {
    return callback(null, null);
  }
  debug('serializeUser ' + profile.username);

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

/**
 * Passport session setup. To support persistent login sessions,
 * Passport needs to be able to serialize users into and deserialize
 * users out of the session.
 */
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

var shutterstockConfig = {
  clientID: SHUTTERSTOCK_CLIENT_ID,
  clientSecret: SHUTTERSTOCK_CLIENT_SECRET,
  callbackURL: URL + '/v1/auth/login/shutterstock/callback',
  scope: ['licenses.create', 'licenses.view', 'purchases.view', 'user.view']
};

/**
 * Set up the shutterstock passport strategy. Strategies in Passport
 * require a `verify` function, which accept credentials (in this case,
 * an accessToken, refreshToken, and Shutterstock profile), and invoke
 * a callback with a user object.
 *
 * @param  {String} accessToken   An accessToken which can be used on subsequent calls
 * @param  {String} refreshToken  Null
 * @param  {Object} profile       User Profile in http://portablecontacts.net/draft-spec.html#schema
 * @param  {Function} callback)   Callback (err, data)
 * @return {Object}               Not used
 */
passport.shutterstock = new ShutterstockStrategy(shutterstockConfig,
  function(accessToken, refreshToken, profile, callback) {
    profile.token = accessToken;
    debug('profile', profile);
    return callback(null, profile);
  });

/**
 * Register the ShutterstockStrategy
 */
passport.use(passport.shutterstock);

/**
 * Do any authentication you want to impose on all requests here
 *
 * @param  {Request}    req  Express Request
 * @param  {Response}   res  Express Response
 * @param  {Function}   next Express next middlware
 * @return {Object}          Not used
 */
function auth(req, res, next) {
  debug('req.session', req.session);
  debug('req.user', req.user);

  next();
}

module.exports = auth;
