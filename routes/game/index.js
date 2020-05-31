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

// Read Game
router.post("/searchWithScheduleIdAndQuarter", function (req, res, next) {
    let schedule_id = req.body.schedule_id;
    let quarter = req.body.quarter;
    let query = `SELECT * from game where schedule_id=${schedule_id} and quarter=${quarter}`
    connection.query(query, function (err, results, fields) {
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
        `DELETE FROM game WHERE id= ${req.body.data.game_id}`,
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

module.exports = router;