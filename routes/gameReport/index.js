const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Hello gameReport World");
});

// Create GameReport
router.post("/create", function (req, res, next) {
  var gameReportData = req.body;

  console.log("Create GameReport", gameReportData);
  connection.query("INSERT INTO gameReport SET ?", gameReportData, function (
    err,
    results,
    fields
  ) {
    if (err) next(err);
    res.send(results);
  });
});

// Read GameReport
router.get("/list", function (req, res, next) {
  connection.query("SELECT * from gameReport", function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Read selected GameReport
router.get("/getinfo/:id", function (req, res, next) {
  let gameReport_id = req.params.id;
  connection.query(
    `SELECT gameReport.*, \
      first_member.name as first_player_name, last_member.name as last_player_name, \
      first_member.uniform_number as first_player_uniform_number, last_member.uniform_number as last_player_uniform_number \
      from gameReport  \
      join member as first_member \
      ON gameReport.first_player = first_member.id \
      left outer join member as last_member \
      ON gameReport.last_player = last_member.id \
      where gameReport.game_id = ?\
    `,
    gameReport_id,
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Read selected GameReport with game_id
router.get("/getInfoWithGameId/:id", function (req, res, next) {
  let game_id = req.params.id;
  connection.query(
    "SELECT * from gameReport where game_id = ?",
    game_id,
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

//  Update GameReport with id
router.put("/update", function (req, res, next) {
  console.log("GameReport Update", req.body);
  let gameReport_id = req.body.gameReport_id;
  let gameReport = req.body.gameReport;

  if (!gameReport_id || !gameReport) {
    return res.status(400).send({
      err: gameReport,
      message: "Please provide gameReport and gameReport_id"
    });
  }

  connection.query(
    "UPDATE gameReport SET ? WHERE id = ?",
    [gameReport, gameReport_id],
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Delete GameReport
router.delete("/delete", function (req, res, next) {
  console.log("Delete GameReport", req.body);
  connection.query(
    "DELETE FROM gameReport WHERE id=?",
    [req.body.gameReport_id],
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

module.exports = router;
