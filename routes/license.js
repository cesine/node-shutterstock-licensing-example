'use strict';

var express = require('express');
var router = express.Router();

/**
 * If the request is authenticated (typically via a persistent login session),
 * the request will proceed.  Otherwise, the user will be redirected to
 * the login page.
 */
var licenseImage = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect('/v1/auth/login/shutterstock?next=/v1/licenses/' + req.params.imageId);
  }

  res.send({
    user: req.user,
    image: {
      id: req.params.imageId
    }
  });
};

var list = function(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect('/v1/auth/login/shutterstock?next=/v1/licenses');
  }

  res.send([]);
};

router.post('/:imageId', licenseImage);
router.get('/', list);

module.exports.licenseImage = licenseImage;
module.exports.list = list;

module.exports.router = router;
