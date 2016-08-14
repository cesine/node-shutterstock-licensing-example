var fs = require('fs');

if (process.env.NODE_ENV === 'production') {
  throw new Error('You should not use debug ssl certificates in production mode.');
}

var config = {
  ssl: {
    key: fs.readFileSync(__dirname + '/ssl_debug.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/ssl_debug.crt', 'utf8')
  }
};

module.exports = config;
