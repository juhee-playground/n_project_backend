const express = require("express");
const connection = require("../../custom_lib/db_connection");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Update Schdeule World");
});

// Create Ranking
router.post("/create", function (req, res, next) {
  var rankingData = req.body;

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

router.get("/goalRanking", function (req, res, next) {

  // 전체기간 랭킹
  let sqlQuery = 'select member.name as name, count(*) as score \
                      from (select * from gameReport where gameReport.event_type = "Goal") as gameReportGoal \
                      join member \
                      join game \
                      where gameReportGoal.first_player = member.id \
                      and game.id = gameReportGoal.game_id \
                      and game.is_jocker is NULL \
                      group by gameReportGoal.first_player order by score desc'

  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

router.get("/goalRankingFilter/:contest/:year/:month", function (req, res, next) {
  let scheduleYear = req.params.year;
  let scheduleMonth = req.params.month;
  let contestType = req.params.contest;
  console.log(contestType);

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

router.get("/assistRanking", function (req, res, next) {

  let sqlQuery = 'select member.name as name, count(*) as score \
                    from (select * from gameReport where gameReport.event_type = "Goal") as gameReportGoal \
                    join member on gameReportGoal.last_player = member.id \
                    join game on game.id = gameReportGoal.game_id\
                    where gameReportGoal.last_player = member.id \
                    and game.is_jocker is NULL\
                    group by gameReportGoal.last_player order by score desc'

  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

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

router.get("/attendRankingFilter/:contest/:year/:month", function (req, res, next) {
  let scheduleYear = req.params.year;
  let scheduleMonth = req.params.month;
  let contestType = req.params.contest;
  console.log(req.params)
  let whereQuery =  makeWhereQuery(scheduleYear, scheduleMonth, contestType)
  if (whereQuery !== ""){
    whereQuery = "where " + whereQuery
  }
  // 선발 출전한 사람들 모음  
  let attendDraft = `SELECT game.id as game_id, member.id AS member_id, member.name AS name \
                    FROM schedule \
                    join \
                      (SELECT game.*, game.home_squad_id AS squad_id FROM nnnn.game \
                      union \
                      SELECT game.*, game.away_squad_id AS squad_id FROM nnnn.game) \
                      AS game \
                    on schedule.id = game.schedule_id \
                    join squad on squad.id = game.squad_id \
                    join (SELECT * FROM memberSquad where memberSquad.position IS NOT NULL) \
                      AS memberSquad on memberSquad.squad_id = squad.id \
                    join member on member.id = memberSquad.member_id \
                    ${whereQuery}`

  // 교체 출전한 사람들 모음
  let attendReplace = `SELECT game.id as game_id, member.id AS member_id, member.name AS name \
                          FROM schedule \
                          JOIN \
                            (SELECT game.*, game.home_squad_id AS squad_id FROM nnnn.game \
                            UNION \
                            SELECT game.*, game.away_squad_id AS squad_id FROM nnnn.game) \
                            AS game \
                            ON schedule.id = game.schedule_id \
                          JOIN (SELECT * FROM gameReport WHERE gameReport.event_type = "Out" AND gameReport.last_player IS NOT NULL) \
                            AS gameReport \
                            ON gameReport.game_id = game.id \
                          JOIN member on member.id = gameReport.last_player \
                          ${whereQuery}`
  let sqlQuery = `SELECT attend.member_id, attend.name, count(*) as score FROM (${attendDraft} UNION ${attendReplace}) AS attend group by attend.member_id order by score desc`
  console.log(attendReplace)
  connection.query(sqlQuery, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

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

router.get("/leagueRanking/:year", function (req, res, next) {
  let scheduleYear = req.params.year;
  let sqlQueryHome = `SELECT unitTeam.id_unit_team, unitTeam.name, unitTeam.description, game.home_score as plusScore, game.away_score as minusScore, unitTeam.emblem \
                    FROM game \
                    join schedule on schedule.id = game.schedule_id \
                    join squad on squad.id = game.home_squad_id \
                    join unitTeam on unitTeam.id_unit_team = squad.team_number \
                    where schedule.type = "L" and DATE_FORMAT(schedule.date, "%Y") = ?`
  let sqlQueryAway = `SELECT unitTeam.id_unit_team, unitTeam.name, unitTeam.description, game.away_score as plusScore, game.home_score as minusScore, unitTeam.emblem \
                    FROM game \
                    join schedule on schedule.id = game.schedule_id \
                    join squad on squad.id = game.away_squad_id \
                    join unitTeam on unitTeam.id_unit_team = squad.team_number \
                    where schedule.type = "L" and DATE_FORMAT(schedule.date, "%Y") = ?`
  let sqlQuery = `select id_unit_team, name, description, emblem, sum(plusScore) as goalEarn, sum(minusScore) as goalLose, \
                      count(if(plusScore > minusScore, 1, null)) as win, \
                      count(if(plusScore < minusScore, 1, null)) as lose, \
                      count(if(plusScore = minusScore, 1, null)) as draw, \
                      count(*) as gameCount \
                      from \
                    (${sqlQueryHome} union all ${sqlQueryAway}) as leagueRanking group by leagueRanking.name order by win, draw`

  connection.query(sqlQuery, [scheduleYear, scheduleYear], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

router.get("/leagueRecord/:year",function(req, res, next){
  let scheduleYear = req.params.year;
  let sqlQuery = `SELECT unitTeam.id_unit_team as homeId, unitTeam.name as home, awayUnitTeam.id_unit_team as awayId, awayUnitTeam.name as away, game.result
                      FROM game 
                      join schedule on schedule.id = game.schedule_id 
                      join squad on squad.id = game.home_squad_id 
                      join squad as awaySquad on awaySquad.id = game.away_squad_id 
                      join unitTeam on unitTeam.id_unit_team = squad.team_number 
                      join unitTeam as awayUnitTeam on awayUnitTeam.id_unit_team = awaySquad.team_number  
                      where schedule.type = "L" and DATE_FORMAT(schedule.date, "%Y") = ?`
  connection.query(sqlQuery, [scheduleYear], function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
})

router.get("/cleanSheetRankingFilter/:contest/:year/:month", function (req, res, next) {
  
  let scheduleYear = req.params.year;
  let scheduleMonth = req.params.month;
  let contestType = req.params.contest;

  let whereQuery =  makeWhereQuery(scheduleYear, scheduleMonth, contestType)
  if (whereQuery !== ""){
    whereQuery = "and " + whereQuery
  }
  
  // goal 
  let sqlQueryHome = `select member.id as member_id, member.name as name, game.id as game_id \
                          from game \
                            join gameReport on game.id = gameReport.game_id \
                            join squad on game.home_squad_id = squad.id \
                            join memberSquad on squad.id = memberSquad.squad_id \
                            join member on memberSquad.member_id = member.id \
                            join schedule on schedule.id = game.schedule_id \
                          WHERE memberSquad.position = "GK" AND \
                            (game.home_score = 0 AND game.away_score <> 0) \
                            ${whereQuery}`
  let sqlQueryAway = `select member.id as member_id, member.name as name, game.id as game_id \
                        from game \
                          join gameReport on game.id = gameReport.game_id \
                          join squad on game.home_squad_id = squad.id \
                          join memberSquad on squad.id = memberSquad.squad_id \
                          join member on memberSquad.member_id = member.id \
                          join schedule on schedule.id = game.schedule_id \
                        WHERE memberSquad.position = "GK" AND \
                          (game.away_score = 0 AND game.home_score <> 0) \
                          ${whereQuery}`
                          
  let additionaAwayQuery = `select gameReport.last_player as member_id, member.name , cleanTable.game_id \
                        from (${sqlQueryAway}) \
                        as cleanTable \
                        join gameReport on gameReport.game_id = cleanTable.game_id \
                        join member on gameReport.last_player = member.id \
                        where gameReport.event_type = 'K.O' and team_type = 'H' and gameReport.last_player is not NULL`
  let additionaHomeQuery = `select gameReport.last_player as member_id, member.name , cleanTable.game_id \
                        from (${sqlQueryHome}) \
                        as cleanTable \
                        join gameReport on gameReport.game_id = cleanTable.game_id \
                        join member on gameReport.last_player = member.id \
                        where gameReport.event_type = 'K.O' and team_type = 'A' and gameReport.last_player is not NULL`

  let totalQuery = `select cleanTable.member_id as id, cleanTable.name as name, count(*) as score \
                        from (${sqlQueryHome} \
                        UNION \
                        ${sqlQueryAway} \
                        UNION \
                        ${additionaHomeQuery} \
                        UNION \
                        ${additionaAwayQuery}) as cleanTable \
                        group by cleanTable.member_id order by score desc`

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
    whereQuery = whereQuery + ` DATE_FORMAT(schedule.date, "%m") = "${scheduleMonth}" and game.is_jocker is NULL`;
  } else if (scheduleMonth == "0") {
    whereQuery = whereQuery + ` DATE_FORMAT(schedule.date, "%Y") = "${scheduleYear}" and game.is_jocker is NULL`;
  } else{
    whereQuery = whereQuery + ` DATE_FORMAT(schedule.date, "%Y-%m") = "${scheduleYear}-${scheduleMonth}" and game.is_jocker is NULL`
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
    whereQuery = whereQuery + " )"
  }
  
  return whereQuery
}

module.exports = router;