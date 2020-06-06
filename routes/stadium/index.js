const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Update stadium World");
});

// Read stadium
router.get("/list", function (req, res, next) {
  connection.query("SELECT * from stadium", function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Retrieve stadium with id
router.get("/stadiums:id", function (req, res, next) {
  let schedule_id = req.params.id;
  if (!schedule_id) {
    return res.status(400).send({
      err: true,
      message: "Please provide schedule_id"
    });
  }
  connection.query("SELECT * FROM stadium where id=?", stadium_id, function (err, results, fields) {
    if (err) next(err);
    if (results.length == 0) {
      res.status(400).send({
        err:true, 
        message:"No Result Found"
      }) 
    }
    res.send(results[0]);
  });
})






module.exports = router;