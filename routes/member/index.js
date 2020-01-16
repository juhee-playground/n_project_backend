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
router.post('/member', function(req, res){
    res.send('Hello Member World');
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
