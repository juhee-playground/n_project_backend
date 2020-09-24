const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function(req, res, next) {
  res.send("Update Team World");
});

// Create Member
router.post("/create", function(req, res, next) {
  var teamData = req.body;
  connection.query("INSERT INTO team SET ?", teamData, function(
    err,
    results,
    fields
  ) {
    if (err) next(err);

    console.log(results.insertId);
    res.send(JSON.stringify(results));
  });
});

// Read Member
router.get("/list", function(req, res, next) {
  connection.query("SELECT * from Team", function(err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Retrieve member with id
router.get("/:id", function(req, res, next) {
  let team_id = req.params.id;
  if (!team_id) {
    return res.status(400).send({
      err: true,
      message: "Please provide team_id"
    });
  }
  connection.query("SELECT * FROM Team where id=?", team_id, function(
    err,
    results,
    fields
  ) {
    if (err) next(err);
    if (results.length == 0) {
      res.status(400).send({
        err:true, 
        message:"No Result Found"
      }) 
    }
    res.send(results[0]);
    
  });
});

//  Update member with id
router.put("/update", function(req, res, next) {
  let team_id = req.body.team_id;
  let team = req.body.team;

  if (!team_id || !team) {
    return res.status(400).send({
      err: team,
      message: "Please provide Team and team_id"
    });
  }

  connection.query(
    "UPDATE team SET ? WHERE id = ?",
    [team, team_id],
    function(err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Delete Member
router.delete("/delete", function(req, res, next) {
  connection.query(
    "DELETE FROM Team WHERE id=?",
    [req.body.team_id],
    function(err, results, fields) {
      if (err) next(err);
      console.log(results);
      res.send(results);
    }
  );
});

module.exports = router;
