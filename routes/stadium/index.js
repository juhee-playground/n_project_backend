const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Update stadium World");
});

// Create stadium
router.post("/create", function(req, res, next) {
  var stadiumData = req.body;
  // stadiumData.created_at = new Date();
  connection.query("INSERT INTO stadium SET ?", stadiumData, function(
    err,
    results,
    fields
  ) {
    if (err) next(err);

    console.log(results.insertId);
    res.send(JSON.stringify(results));
  });
});

// Read stadium
router.get("/list", function (req, res, next) {
  connection.query("SELECT * from stadium", function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Retrieve stadium with id
router.get("/stadium/:id", function (req, res, next) {
  let stadium_id = req.params.id;
  if (!stadium_id) {
    return res.status(400).send({
      err: true,
      message: "Please provide stadium_id"
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


//  Update stadium with id
router.put("/update", function(req, res, next) {
  let stadium_id = req.body.stadium_id;
  let stadium = req.body.stadium;
  
  if (!stadium_id || !stadium) {
    return res.status(400).send({
      err: stadium,
      message: "Please provide stadium and stadium_id"
    });
  }

  connection.query(
    "UPDATE stadium SET ? WHERE id = ?",
    [stadium, stadium_id],
    function(err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Delete stadium
router.delete("/delete", function(req, res, next) {
  connection.query(
    "DELETE FROM stadium WHERE id=?",
    [req.body.stadium_id],
    function(err, results, fields) {
      if (err) next(err);
      console.log(results);
      res.send(results);
    }
  );
});





module.exports = router;