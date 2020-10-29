const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function(req, res, next) {
  res.send("Update UnitTeam World");
});

// Create Member
router.post("/create", function(req, res, next) {
  var teamData = req.body;
  connection.query("INSERT INTO unitTeam SET ?", teamData, function(
    err,
    results,
    fields
  ) {
    if (err) next(err);

    console.log(results.insertId);
    res.send(JSON.stringify(results));
  });
});

router.get("/list", function(req, res, next) {
  connection.query("SELECT * from unitTeam", function(err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

router.get("/:id", function(req, res, next) {
  let unit_team_id = req.params.id;
  if (!unit_team_id) {
    return res.status(400).send({
      err: true,
      message: "Please provide unit_team_id"
    });
  }
  connection.query("SELECT * FROM unitTeam where id_unit_team=?", unit_team_id, function(
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
      message: "Please provide unitTeam and unit_team_id"
    });
  }

  connection.query(
    "UPDATE unitTeam SET ? WHERE unit_team_id = ?",
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
    "DELETE FROM unitTeam WHERE unit_team_id=?",
    [req.body.team_id],
    function(err, results, fields) {
      if (err) next(err);
      console.log(results);
      res.send(results);
    }
  );
});

//Read selected TeamSplit
router.get("/getSplitTeamWithUnitTeam/:year/:scheduleId", function (req, res, next) {
  let season = req.params.year;
  let scheduleId = req.params.scheduleId;
  console.log(season, scheduleId)
  let query = "SELECT unitMember.member_id, unit_team_id as team_number, 1 as team_split_index, member.name, member.uniform_number \
                  FROM unitTeam \
                  join unitMember on unitTeam.id_unit_team = unitMember.unit_team_id \
                  join member on unitMember.member_id = member.id \
                  join attend on attend.member_id = unitMember.member_id \
                  where unitTeam.season = ? and attend.schedule_id = ?;"
  connection.query(query, [season, scheduleId], function (err, results, fields) {
      if (err) next(err);
      res.send(results);
  });
});


module.exports = router;
