const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Update Schdeule World");
});

// Create Ranking
router.post("/create", function (req, res, next) {
  var rankingData = req.body;

  console.log(rankingData);
  connection.query("INSERT INTO ranking SET ?", rankingData, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Read ranking
router.get("/list", function (req, res, next) {
  connection.query("SELECT * from ranking", function (err, results, fields) {
      if (err) next(err);
      res.send(results);
  });
});


//  Update ranking with id
router.put("/update", function (req, res, next) {
  let ranking_id = req.body.ranking_id;
  let ranking = req.body.ranking;

  console.log(req.body);
  if (!ranking_id || !ranking) {
    return res.status(400).send({
      err: ranking,
      message: "Please provide ranking and ranking_id"
    });
  }

  connection.query(
    "UPDATE ranking SET ? WHERE id = ?",
    [ranking, ranking_id],
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Delete ranking
router.delete("/delete", function (req, res, next) {
  console.log(req.body);
  connection.query(
    "DELETE FROM ranking WHERE id=?",
    [req.body.ranking_id],
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Read ranking
router.get("/goalRanking", function (req, res, next) {
  
  // 전체기간 랭킹
  let sqlQuery = 'select member.name as name, count(*) as score \
  from (select * from gameReport where gameReport.event = "goal") as gameReportGoal \
  join member \
  where gameReportGoal.member_A = member.id \
  group by gameReportGoal.member_A'

  connection.query(sqlQuery, function (err, results, fields) {
      if (err) next(err);
      res.send(results);
  });
});

// Read ranking
router.get("/assistRanking", function (req, res, next) {
  // 기간을 넣고 싶으면 아래 부분 수행할 것
  // 0. 최근 1년이든 날짜를 받든지 선택
  // 1. 날짜 범위에 해당하는 shedule_id 선택 
  // 2. 스케쥴과 매칭되는 game_id 선택
  // 3. (모든/일부) game_id에 해당하고

  // 전체기간 랭킹
  let sqlQuery = 'select member.name as name, count(*) as score \
  from (select * from gameReport where gameReport.event = "goal") as gameReportGoal \
  join member \
  where gameReportGoal.member_B = member.id \
  group by gameReportGoal.member_B'

  connection.query(sqlQuery, function (err, results, fields) {
      if (err) next(err);
      res.send(results);
  });
});

// Read ranking
router.get("/cleanSheetRanking", function (req, res, next) {
  
  // goal 
  let sqlQuery = ''

  connection.query(sqlQuery, function (err, results, fields) {
      if (err) next(err);
      res.send(results);
  });
});

module.exports = router;