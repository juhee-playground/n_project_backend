const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

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

module.exports = router;