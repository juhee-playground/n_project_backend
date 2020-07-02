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
                      from (select * from gameReport where gameReport.event_type = "Goal") as gameReportGoal \
                      join member \
                      where gameReportGoal.first_player = member.id \
                      group by gameReportGoal.first_player order by score desc'

  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
// Read ranking
router.get("/goalRankingFilter/:contest/:year/:month", function (req, res, next) {
  let scheduleYear = req.params.year;
  let scheduleMonth = req.params.month;
  let contestType = req.params.contest;

  let whereQuery =  makeWhereQuery(scheduleYear, scheduleMonth, contestType)
  if (whereQuery !== ""){
    whereQuery = "where " + whereQuery
  }
  
  // 전체기간 랭킹
  let sqlQuery = `select member.name as name, count(*) as score \
                      from (select * from gameReport where gameReport.event_type = "Goal") as gameReportGoal \
                      join member on gameReportGoal.first_player = member.id \
                      join game on game.id = gameReportGoal.game_id \
                      join schedule on schedule.id = game.schedule_id \
                      ${whereQuery} \
                      group by gameReportGoal.first_player order by score desc`
  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});



// Read ranking
router.get("/assistRanking", function (req, res, next) {

  let sqlQuery = 'select member.name as name, count(*) as score \
                    from (select * from gameReport where gameReport.event_type = "Goal") as gameReportGoal \
                    join member on gameReportGoal.last_player = member.id \
                    where gameReportGoal.last_player = member.id \
                    group by gameReportGoal.last_player order by score desc'

  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Read ranking
router.get("/assistRankingFilter/:contest/:year/:month", function (req, res, next) {
  let scheduleYear = req.params.year;
  let scheduleMonth = req.params.month;
  let contestType = req.params.contest;

  let whereQuery =  makeWhereQuery(scheduleYear, scheduleMonth, contestType)
  if (whereQuery !== ""){
    whereQuery = "where " + whereQuery
  }
  
  let sqlQuery = `select member.name as name, count(*) as score \
                    from (select * from gameReport where gameReport.event_type = "Goal") as gameReportGoal \
                    join member on gameReportGoal.last_player = member.id \
                    join game on game.id = gameReportGoal.game_id \
                    join schedule on schedule.id = game.schedule_id \
                    ${whereQuery} \
                    group by gameReportGoal.last_player order by score desc`

  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
// Read ranking
router.get("/cleanSheetRanking", function (req, res, next) {

  // goal 
  let sqlQueryHome = 'select member.id as id, member.name as name, game.id as game_id \
                          from game \
                            join gameReport on game.id = gameReport.game_id \
                            join squad on game.home_squad_id = squad.id \
                            join memberSquad on squad.id = memberSquad.squad_id \
                            join member on memberSquad.member_id = member.id \
                          WHERE memberSquad.position = "GK" \
                            AND (game.home_score = 0 AND game.away_score <> 0)'
  let sqlQueryAway = 'select member.id as id, member.name as name, game.id as game_id \
                        from game \
                          join gameReport on game.id = gameReport.game_id \
                          join squad on game.home_squad_id = squad.id \
                          join memberSquad on squad.id = memberSquad.squad_id \
                          join member on memberSquad.member_id = member.id \
                        WHERE memberSquad.position = "GK" \
                          AND (game.away_score = 0 AND game.home_score <> 0)'

  let totalQuery = `select cleanTable.id as id, cleanTable.name as name, count(*) as score \
                    from (${sqlQueryHome} \
                    UNION \
                    ${sqlQueryAway}) as cleanTable \
                    group by cleanTable.id order by score desc`
                    

  connection.query(totalQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});
router.get("/cleanSheetRankingFilter/:contest/:year/:month", function (req, res, next) {
  
  let scheduleYear = req.params.year;
  let scheduleMonth = req.params.month;
  let contestType = req.params.contest;

  let whereQuery =  makeWhereQuery(scheduleYear, scheduleMonth, contestType)
  if (whereQuery !== ""){
    whereQuery = "and " + whereQuery
  }
  
  // goal 
  let sqlQueryHome = `select member.id as id, member.name as name, game.id as game_id \
                          from game \
                            join gameReport on game.id = gameReport.game_id \
                            join squad on game.home_squad_id = squad.id \
                            join memberSquad on squad.id = memberSquad.squad_id \
                            join member on memberSquad.member_id = member.id \
                            join schedule on schedule.id = game.schedule_id \
                          WHERE memberSquad.position = "GK" AND \
                            (game.home_score = 0 AND game.away_score <> 0) \
                            ${whereQuery}`
  let sqlQueryAway = `select member.id as id, member.name as name, game.id as game_id \
                        from game \
                          join gameReport on game.id = gameReport.game_id \
                          join squad on game.home_squad_id = squad.id \
                          join memberSquad on squad.id = memberSquad.squad_id \
                          join member on memberSquad.member_id = member.id \
                          join schedule on schedule.id = game.schedule_id \
                        WHERE memberSquad.position = "GK" AND \
                          (game.away_score = 0 AND game.home_score <> 0) \
                          ${whereQuery}`

  let totalQuery = `select cleanTable.id as id, cleanTable.name as name, count(*) as score \
                    from (${sqlQueryHome} \
                    UNION \
                    ${sqlQueryAway}) as cleanTable \
                    group by cleanTable.id order by score desc`

  connection.query(totalQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

function makeWhereQuery(scheduleYear, scheduleMonth, contestType){
  console.log("makeWhereQuery", scheduleYear, scheduleMonth, contestType)
  let whereQuery = ""

  if (scheduleYear =="0" && scheduleMonth == "0"){
    
  } else if (scheduleYear == "0") {
    whereQuery = whereQuery + ` DATE_FORMAT(schedule.date, "%m") = "${scheduleMonth}" `;
  } else if (scheduleMonth == "0") {
    whereQuery = whereQuery + ` DATE_FORMAT(schedule.date, "%Y") = "${scheduleYear}" `;
  } else{
    whereQuery = whereQuery + ` DATE_FORMAT(schedule.date, "%Y-%m") = "${scheduleYear}-${scheduleMonth}" `
  }

  if (contestType != "" ){
    if (whereQuery !== ""){
      whereQuery = whereQuery + ` and `
    }
    contestList = contestType.split(',')
    whereQuery = whereQuery + "("
    for (let i in contestList){
      let singleContest = contestList[i]
      whereQuery = whereQuery + ` schedule.type = "${singleContest}" `
      
      if ( (Number(i)+1) != Number(contestList.length)){
        whereQuery = whereQuery + " or "
      }
    }
    whereQuery = whereQuery + ")"
  }
  
  return whereQuery
}

module.exports = router;