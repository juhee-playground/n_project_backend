var mysql      = require('mysql');
var dbconfig   = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);


module.exports = connection;