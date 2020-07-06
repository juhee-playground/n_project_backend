const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Update Schdeule World");
});

// Create Schedule
router.post("/create", function (req, res, next) {
  var scheduleData = req.body;

  console.log(scheduleData);
  connection.query("INSERT INTO schedule SET ?", scheduleData, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Read schedule
router.get("/list", function (req, res, next) {
  connection.query(
    "SELECT schedule.id, date_format(schedule.date,'%Y-%m-%d') as date, \
        schedule.type, schedule.start_time as start, schedule.end_time as end, \
        schedule.name, schedule.stadium_id,\
        stadium.name as stadium_name, stadium.address, \
        count(game.id) as game_count \
        FROM schedule \
        INNER JOIN stadium as stadium \
        ON schedule.stadium_id = stadium.id \
        LEFT JOIN game ON game.schedule_id = schedule.id \
        group by schedule.id \
        order by date",
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});


// Retrieve schedule with id
router.get("/getInfo/:id", function (req, res, next) {
  let schedule_id = req.params.id;
  if (!schedule_id) {
    return res.status(400).send({
      err: true,
      message: "Please provide schedule_id"
    });
  }
  connection.query("SELECT schedule.id, schedule.name, date_format(schedule.date,'%Y-%m-%d') as date, \
        date_format(schedule.start_time, '%H:%i') as start_time, \
        date_format(schedule.end_time, '%H:%i') as end_time, schedule.type, \
        stadium.id as stadium_id, stadium.name as place, stadium.address, stadium.nick_name FROM schedule \
        INNER JOIN stadium ON schedule.stadium_id = stadium.id \
        where schedule.id=?", schedule_id, function (err, results, fields) {
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

//  Update schedule with id
router.put("/update", function (req, res, next) {
  let schedule_id = req.body.schedule_id;
  let schedule = req.body.schedule;

  console.log(req.body);
  if (!schedule_id || !schedule) {
    return res.status(400).send({
      err: schedule,
      message: "Please provide schedule and schedule_id"
    });
  }

  connection.query(
    "UPDATE schedule SET ? WHERE id = ?",
    [schedule, schedule_id],
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Delete schedule
router.delete("/delete", function (req, res, next) {
  connection.query(
    "DELETE FROM schedule WHERE id=?",
    [req.body.schedule_id],
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

module.exports = router;