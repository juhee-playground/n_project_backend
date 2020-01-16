const express = require('express');
const connection = require("../../custom_lib/db_connection")

const router = express.Router();

router.get('/', function(req, res){
    res.send('Update Member World');
});

// Create Member
router.post('/create', function(req, res){
    res.send('Create Member World');
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
