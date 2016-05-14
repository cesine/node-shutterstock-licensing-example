'use strict';

var express = require('express');
var router = express.Router();

/* GET users listing */
router.get('/', function(req, res) {
  res.json([]);
});

/* GET user details */
router.get('/:username', function(req, res) {
  res.json({
    username: req.params.username
  });
});

module.exports = router;
