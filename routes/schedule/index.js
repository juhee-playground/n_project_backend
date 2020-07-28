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
      message: "Please provide schedule_id",
    });
  }
  connection.query(
    "SELECT schedule.id, schedule.name, date_format(schedule.date,'%Y-%m-%d') as date, \
        date_format(schedule.start_time, '%H:%i') as start_time, \
        date_format(schedule.end_time, '%H:%i') as end_time, schedule.type, \
        stadium.id as stadium_id, stadium.name as place, stadium.address, stadium.nick_name FROM schedule \
        INNER JOIN stadium ON schedule.stadium_id = stadium.id \
        where schedule.id=?",
    schedule_id,
    function (err, results, fields) {
      if (err) next(err);
      if (results.length == 0) {
        res.status(400).send({
          err: true,
          message: "No Result Found",
        });
      }
      res.send(results[0]);
    }
  );
});

// Read game Attendance count
router.post("/gameAttendCountByYear/:mebmerId", function (req, res, next) {
  let memberId = req.params.mebmerId;
  if (!memberId) {
    return res.status(400).send({
      err: true,
      message: "Please provide memberId",
    });
  }
  let query = `select member.id, member.name, count(*) as count, date_format(schedule.date, '%Y') as year \
                  from nnnn.game as game \
                    join nnnn.schedule as schedule \
                    on game.schedule_id = schedule.id	 \
                  join nnnn.squad as squad \
                    on nnnn.squad.id = nnnn.game.home_squad_id  \
                    or nnnn.squad.id = nnnn.game.away_squad_id  \
                  join nnnn.memberSquad  \
                    on nnnn.memberSquad.squad_id = nnnn.squad.id \
                  join nnnn.member as member \
                    on nnnn.member.id = nnnn.memberSquad.member_id \
                  WHERE member.id = ${memberId} \
                  GROUP BY member.id, year order by count desc`;
  connection.query(query, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
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
      message: "Please provide schedule and schedule_id",
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

// List Members
// Retrieve schedule with id
router.get("/getAttendList/:year/:month", function (req, res, next) {
  let year = req.params.year; // year는 4자리
  let month = req.params.month; // month는 2자리 zerofill
  if (!year || !month) {
    return res.status(400).send({
      err: true,
      message: "Please provide Year & Month",
    });
  }
  let yearMonth = year + month;
  connection.query(
    `SELECT * from \
                     ((SELECT game.id as game_id, schedule.id as schedule_id, member.name as home_member_name, null as away_member_name \
                        FROM schedule \
                        join game on game.schedule_id = schedule.id \
                        join gameReport on gameReport.game_id = game.id \
                        join squad on squad.id = game.home_squad_id \
                        join memberSquad on memberSquad.squad_id = squad.id \
                        join member on member.id = memberSquad.member_id \
                        where date_format(date,"%Y%m") = ${yearMonth}) \
                    UNION ALL \
                      (SELECT game.id as game_id, schedule.id as schedule_id, null as home_member_name, member.name as away_member_name \
                        FROM schedule \
                        join game on game.schedule_id = schedule.id  \
                        join gameReport on gameReport.game_id = game.id \
                        join squad on squad.id = game.away_squad_id     \
                        join memberSquad on memberSquad.squad_id = squad.id  \
                        join member on member.id = memberSquad.member_id \
                        where date_format(date,"%Y%m") = ${yearMonth})) as content`,
    function (err, results, fields) {
      if (err) next(err);
      if (results.length == 0) {
        res.status(400).send({
          err: true,
          message: "No Result Found",
        });
      }
      res.send(results);
    }
  );
});

module.exports = router;
