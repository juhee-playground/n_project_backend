var mysql      = require('mysql');
var dbconfig   = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);

connection.connect((err)=>{
    if(!err){
        console.log("Mysql Connected!!");
    }
    else{
        console.log("Mysql Connection Failed", err);
    }
})

module.exports = connection;