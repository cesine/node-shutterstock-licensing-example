var Sequelize = require('sequelize');

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

exports.sequelize = sequelize;
exports.User = User;
