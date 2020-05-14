var mysql      = require('mysql');
var dbconfig   = require('../config/database.js');

// mysql pooling connection 참고 
// https://www.npmjs.com/package/mysql#pooling-connections 

var pool = mysql.createPool(dbconfig);
pool.on('acquire', function (connection) {
    console.log('Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment=1')
});
pool.on('enqueue', function () {
    console.log('Waiting for available connection slot');
});
pool.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId);
});


module.exports = pool;