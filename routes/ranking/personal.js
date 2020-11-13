const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();


router.get("/myAssister/:id", function (req, res, next) {
  const id = req.params.id

  const data = [id]
  let sqlQuery = `select member.name, member.id as member_id, count(*) as score
                    from schedule 
                    join game on game.schedule_id = schedule.id
                    join (select * from gameReport where gameReport.event_type="Goal" and gameReport.first_player = ?) as gameReport on gameReport.game_id = game.id
                    join member on member.id = gameReport.last_player
                    group by member.name
                    order by score desc`

  connection.query(sqlQuery, data, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/myAssister/:id/:year", function (req, res, next) {
  const id = req.params.id
  const year = req.params.year
  const data = [id, year]
  let sqlQuery = `select member.name, member.id as member_id, count(*) as score
                    from schedule 
                    join game on game.schedule_id = schedule.id
                    join (select * from gameReport where gameReport.event_type="Goal" and gameReport.first_player = ?) as gameReport on gameReport.game_id = game.id
                    join member on member.id = gameReport.last_player
                    where DATE_FORMAT(schedule.date, "%Y") = ?
                    group by member.name
                    order by score desc`

  connection.query(sqlQuery, data, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/myGoaler/:id", function (req, res, next) {
  const id = req.params.id
  const data = [id]
  let sqlQuery = `select member.name, member.id as member_id, count(*) as score
                    from schedule 
                    join game on game.schedule_id = schedule.id
                    join (select * from gameReport where gameReport.event_type="Goal" and gameReport.last_player = ?) as gameReport on gameReport.game_id = game.id
                    join member on member.id = gameReport.first_player
                    group by member.name
                    order by score desc`

  connection.query(sqlQuery, data, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/myGoaler/:id/:year", function (req, res, next) {
  const id = req.params.id
  const year = req.params.year
  const data = [id, year]
  let sqlQuery = `select member.name, member.id as member_id, count(*) as score
                    from schedule 
                    join game on game.schedule_id = schedule.id
                    join (select * from gameReport where gameReport.event_type="Goal" and gameReport.last_player = ?) as gameReport on gameReport.game_id = game.id
                    join member on member.id = gameReport.first_player
                    where DATE_FORMAT(schedule.date, "%Y") = ?
                    group by member.name
                    order by score desc`

  connection.query(sqlQuery, data, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// 참석 스케쥴, 
router.get("/scheduleCount/:id", function (req, res, next) {
  const memberId = req.params.id

  let sqlQuery = `SELECT member.id, member.name, count(*) AS score \
                      FROM schedule \
                      JOIN (SELECT * FROM attend where attend.member_id  = ?) AS attend ON attend.schedule_id = schedule.id \
                      JOIN member ON attend.member_id = member.id \
                      GROUP BY attend.member_id \
                      ORDER BY score desc`

  connection.query(sqlQuery, [memberId], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/scheduleCount/:id/:year", function (req, res, next) {
  const memberId = req.params.id
  const scheduleYear = req.params.year 

  let sqlQuery = `SELECT member.id, member.name, count(*) AS score \
                      FROM (SELECT * FROM schedule where DATE_FORMAT(schedule.date, "%Y") = ?) AS schedule \
                      JOIN (SELECT * FROM attend where attend.member_id  = ?) AS attend ON attend.schedule_id = schedule.id \
                      JOIN member ON attend.member_id = member.id \
                      GROUP BY attend.member_id \
                      ORDER BY score desc`

  connection.query(sqlQuery, [scheduleYear, memberId], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// 참석 게임
router.get("/gameCount/:id", function (req, res, next) {
  let memberId = req.params.id;

  // 선발 출전한 사람들 모음  
  let attendDraft = `SELECT game.id as game_id, member.id AS member_id, member.name AS name \
                    FROM schedule \
                    JOIN \
                      (SELECT game.*, game.home_squad_id AS squad_id FROM nnnn.game \
                      union \
                      SELECT game.*, game.away_squad_id AS squad_id FROM nnnn.game) \
                      AS game \
                    on schedule.id = game.schedule_id \
                    JOIN squad on squad.id = game.squad_id \
                    JOIN (SELECT * FROM memberSquad where memberSquad.position IS NOT NULL and memberSquad.member_id = ${memberId}) \
                      AS memberSquad on memberSquad.squad_id = squad.id \
                    JOIN member on member.id = memberSquad.member_id`

  // 교체 출전한 사람들 모음
  let attendReplace = `SELECT game.id as game_id, member.id AS member_id, member.name AS name \
                          FROM schedule \
                          JOIN \
                            (SELECT game.*, game.home_squad_id AS squad_id FROM nnnn.game \
                            UNION \
                            SELECT game.*, game.away_squad_id AS squad_id FROM nnnn.game) \
                            AS game \
                            ON schedule.id = game.schedule_id \
                          JOIN (SELECT * FROM gameReport WHERE gameReport.event_type = "Out" AND gameReport.last_player = ${memberId}) \
                            AS gameReport \
                            ON gameReport.game_id = game.id \
                          JOIN member on member.id = gameReport.last_player`
  let sqlQuery = `SELECT attend.member_id, attend.name, count(*) as score FROM (${attendDraft} UNION ${attendReplace}) AS attend group by attend.member_id order by score desc`
  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/gameCount/:id/:year", function (req, res, next) {
  let memberId = req.params.id;
  let scheduleYear = req.params.year;

  // 선발 출전한 사람들 모음  
  let attendDraft = `SELECT game.id as game_id, member.id AS member_id, member.name AS name \
                    FROM (SELECT * FROM schedule where DATE_FORMAT(schedule.date, "%Y") = ${scheduleYear}) AS schedule \
                    JOIN \
                      (SELECT game.*, game.home_squad_id AS squad_id FROM nnnn.game \
                      union \
                      SELECT game.*, game.away_squad_id AS squad_id FROM nnnn.game) \
                      AS game \
                    on schedule.id = game.schedule_id \
                    JOIN squad on squad.id = game.squad_id \
                    JOIN (SELECT * FROM memberSquad where memberSquad.position IS NOT NULL and memberSquad.member_id = ${memberId}) \
                      AS memberSquad on memberSquad.squad_id = squad.id \
                    JOIN member on member.id = memberSquad.member_id`

  // 교체 출전한 사람들 모음
  let attendReplace = `SELECT game.id as game_id, member.id AS member_id, member.name AS name \
                          FROM (SELECT * FROM schedule where DATE_FORMAT(schedule.date, "%Y") = ${scheduleYear}) AS schedule \
                          JOIN \
                            (SELECT game.*, game.home_squad_id AS squad_id FROM nnnn.game \
                            UNION \
                            SELECT game.*, game.away_squad_id AS squad_id FROM nnnn.game) \
                            AS game \
                            ON schedule.id = game.schedule_id \
                          JOIN (SELECT * FROM gameReport WHERE gameReport.event_type = "Out" AND gameReport.last_player = ${memberId}) \
                            AS gameReport \
                            ON gameReport.game_id = game.id \
                          JOIN member on member.id = gameReport.last_player`
  let sqlQuery = `SELECT attend.member_id, attend.name, count(*) as score FROM (${attendDraft} UNION ${attendReplace}) AS attend group by attend.member_id order by score desc`
  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

router.get("/goalCount/:id", function (req, res, next) {
  const memberId = req.params.id

  let sqlQuery = `SELECT member.id, member.name, count(*) AS score \
                      FROM schedule \
                      JOIN game ON game.schedule_id = schedule.id \
                      JOIN (SELECT * FROM gameReport where gameReport.event_type = "Goal" AND gameReport.first_player  = ?) AS gameReportGoal \
                        ON gameReportGoal.game_id = game.id \
                      JOIN member ON gameReportGoal.first_player = member.id \
                      GROUP BY gameReportGoal.first_player \
                      ORDER BY score desc`

  connection.query(sqlQuery, [memberId], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/goalCount/:id/:year", function (req, res, next) {
  const memberId = req.params.id
  const scheduleYear = req.params.year 
  
  // 전체기간 랭킹
  let sqlQuery = `SELECT member.id, member.name, count(*) AS score \
                      FROM (SELECT * FROM schedule where DATE_FORMAT(schedule.date, "%Y") = ?) AS schedule \
                      JOIN game ON game.schedule_id = schedule.id \
                      JOIN (SELECT * FROM gameReport where gameReport.event_type = "Goal" AND gameReport.first_player  = ?) AS gameReportGoal \
                        ON gameReportGoal.game_id = game.id \
                      JOIN member ON gameReportGoal.first_player = member.id \
                      GROUP BY gameReportGoal.first_player \
                      ORDER BY score desc`

  connection.query(sqlQuery, [scheduleYear, memberId], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

router.get("/assistCount/:id", function (req, res, next) {
  const memberId = req.params.id

  let sqlQuery = `SELECT member.id, member.name, count(*) AS score \
                      FROM schedule \
                      JOIN game ON game.schedule_id = schedule.id \
                      JOIN (SELECT * FROM gameReport where gameReport.event_type = "Goal" AND gameReport.last_player  = ?) AS gameReportGoal \
                        ON gameReportGoal.game_id = game.id \
                      JOIN member ON gameReportGoal.last_player = member.id \
                      GROUP BY gameReportGoal.last_player \
                      ORDER BY score desc`

  connection.query(sqlQuery, [memberId], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/assistCount/:id/:year", function (req, res, next) {
  const memberId = req.params.id
  const scheduleYear = req.params.year 
  
  // 전체기간 랭킹
  let sqlQuery = `SELECT member.id, member.name, count(*) AS score \
                      FROM (SELECT * FROM schedule where DATE_FORMAT(schedule.date, "%Y") = ?) AS schedule \
                      JOIN game ON game.schedule_id = schedule.id \
                      JOIN (SELECT * FROM gameReport where gameReport.event_type = "Goal" AND gameReport.last_player  = ?) AS gameReportGoal \
                        ON gameReportGoal.game_id = game.id \
                      JOIN member ON gameReportGoal.last_player = member.id \
                      GROUP BY gameReportGoal.last_player \
                      ORDER BY score desc`

  connection.query(sqlQuery, [scheduleYear, memberId], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

module.exports = router;