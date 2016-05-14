'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  var userJSON;

  if (req.user) {
    userJSON = JSON.stringify(req.user, null, 2);
  }

  res.render('index', {
    title: 'Express',
    user: req.user,
    userJSON: userJSON
  });
});

module.exports = router;
