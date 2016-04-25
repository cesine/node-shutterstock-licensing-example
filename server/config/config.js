var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
    development: {
        rootPath: rootPath,
        db: 'mongodb://localhost/shutterstock licensing example node',
        port: process.env.PORT || 9001
    }
};