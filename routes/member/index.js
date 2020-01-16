const express = require('express');
const connection = require("../../custom_lib/db_connection")

const router = express.Router();

router.get('/', function(req, res){
    res.send('Update Member World');
});

// Create Member
router.post('/create', function(req, res){
    var memberData = req.body
    memberData.created_at = new Date();
    
    connection.query('INSERT INTO member SET ?', memberData, function(err,results, fields) {
        if(err) throw err;
        console.log(results.insertId);
        res.send(JSON.stringify(results));
    });
});

// Read Member
router.get('/member', function(req, res){
    connection.query('SELECT * from member', function(err, results, fields) {
        if(err) {
            res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }else{
            res.send(JSON.stringify({"status":200, "error":null, "response": results}));
        }
    });
});

// Update Member
router.get('/update', function(req, res){
    res.send('Update Member World');
});

// Delete Member
router.post('/delete', function(req, res){
    res.send('Delete Member World');
});

module.exports = router
