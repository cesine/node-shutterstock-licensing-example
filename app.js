'use strict';

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var debug = require('debug')('app');
var exphbs = require('express-handlebars');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var path = require('path');
var session = require('express-session');

var authMiddleware = require('./middleware/auth');
var errors = require('./middleware/error');
var routes = require('./routes/index');
var authRoutes = require('./routes/auth').router;
var licenseRoutes = require('./routes/license').router;
var userRoutes = require('./routes/user');

var app = express();

var env = process.env.NODE_ENV || 'dev';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === 'dev';

/**
 * Config
 */
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger(env));

/**
 * Views
 */
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/']
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

/**
 * Body parsers
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/**
 * Persistant sessions and authentication
 */
app.use(cookieParser());
app.use(session({
  secret: 'wieoo923iweosdoijo',
  // resave: true,
  // saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(authMiddleware);

/**
 * Serve static files
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes
 */
app.use('/v1/auth', authRoutes);
app.use('/v1/license', licenseRoutes);
app.use('/v1/users', userRoutes);
app.use('/', routes);

/**
 * If not found
 */
app.use(function(req, res, next) {
  debug(req.url + ' was not found');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * Attach error handler
 */
app.use(errors);

module.exports = app;
