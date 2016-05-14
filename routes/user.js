'use strict';

var express = require('express');
var router = express.Router();

/* GET users listing */
router.get('/', function(req, res) {
  res.json([]);
});

/* GET user details */
router.get('/:username', function(req, res) {
  req.user = req.user || {
    username: req.params.username,
    from: 'routes/user'
  }

  res.json(req.user);
});

module.exports = router;
