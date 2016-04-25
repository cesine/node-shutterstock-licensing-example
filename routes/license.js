'use strict';

var express = require('express');
var router = express.Router();

/**
 * Simple route middleware to ensure user is authenticated. Use this
 * route middleware on any resource that needs to be protected.  If
 * the request is authenticated (typically via a persistent login
 * session), the request will proceed.  Otherwise, the user will be
 * redirected to the login page.
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/v1/auth/login');
}

var getImage = function(req, res) {
  res.send({
    user: req.user,
    image: {
      id: req.params.imageId
    }
  });
};
router.get('/:imageId', ensureAuthenticated, getImage);

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.getImage = getImage;

module.exports.router = router;
