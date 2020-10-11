const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
    res.send("Hello game World");
});

// Create Game
router.post("/create", function (req, res, next) {
    var gameData = req.body;

    console.log('Create Game', gameData);
    connection.query("INSERT INTO game SET ?", gameData, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

// Read Game
router.get("/list", function (req, res, next) {
    connection.query("SELECT * from game", function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//Read selected Game
router.get("/getinfo/:id", function (req, res, next) {
    let game_id = req.params.id;
    connection.query("SELECT * from game where id = ?", game_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//Read selected multiflexGameInfo => schdule_date, stadium, gameInfo
router.get("/getMultiplexInfo/:id", function (req, res, next) {
    let game_id = req.params.id;
    connection.query("SELECT schedule.id as schedule_id, schedule.type, schedule.date, stadium.id as stadium_id, stadium.name as stadium_name, \
                      game.id as game_id, game.quarter, game.home_squad_id, game.away_squad_id, game.home_score, game.away_score, game.result \
                      FROM schedule \
                      INNER JOIN stadium ON schedule.stadium_id = stadium.id \
                      INNER JOIN game ON schedule.id = game.schedule_id \
                      where game.id = ?", game_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

router.get("/getHomeTeamInfoWithGameId/:id", function (req, res, next) {
    let game_id = req.params.id;
    connection.query(
    " SELECT member.name, member.id, memberSquad.position \
        FROM game \
        INNER JOIN memberSquad ON game.home_squad_id = memberSquad.squad_id \
        INNER JOIN member ON member.id = memberSquad.member_id \
        where game.id = ? ",
        game_id,
        function (err, results, fields) {
        if (err) next(err);
        res.send(results);
        }
    );
});

router.get("/getAwayTeamInfoWithGameId/:id", function (req, res, next) {
    let game_id = req.params.id;
    connection.query(
    " SELECT member.name, member.id, memberSquad.position \
        FROM game \
        INNER JOIN memberSquad ON game.away_squad_id = memberSquad.squad_id \
        INNER JOIN member ON member.id = memberSquad.member_id \
        where game.id = ? ",
        game_id,
        function (err, results, fields) {
        if (err) next(err);
        res.send(results);
        }
    );
});
  

// Read Game
router.post("/searchWithScheduleIdAndQuarter", function (req, res, next) {
    let schedule_id = req.body.schedule_id;
    let quarter = req.body.quarter;
    let query = `SELECT * from game where schedule_id=? and quarter=?`
    let dataList = [schedule_id, quarter]
    connection.query(query, dataList, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

// Read Game search filtering schedule_id 
router.post("/searchWithScheduleId", function (req, res, next) {
    let schedule_id = req.body.schedule_id;
    let query = `SELECT * from game where schedule_id=?`
    connection.query(query, schedule_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//  Update Game with id
router.put("/update", function (req, res, next) {
    console.log("Game Update", req.body);
    let game_id = req.body.game_id;
    let game = req.body.game;

    if (!game_id || !game) {
        return res.status(400).send({
            err: game,
            message: "Please provide game and game_id"
        });
    }

    connection.query(
        "UPDATE game SET ? WHERE id = ?",
        [game, game_id],
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

// Delete Game
router.delete("/delete", function (req, res, next) {
    console.log('Delete Game', req.body.data);
    connection.query(
        `DELETE FROM game WHERE id= ?`,
        req.body.data.game_id,
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

module.exports = router;