const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
    res.send("Hello gameReport World");
});

// Create GameReport
router.post("/create", function (req, res, next) {
    var gameReportData = req.body;

    console.log('Create GameReport', gameReportData);
    connection.query("INSERT INTO gameReport SET ?", gameReportData, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

// Read GameReport
router.get("/list", function (req, res, next) {
    connection.query("SELECT * from gameReport", function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//Read selected GameReport
router.get("/getinfo/:id", function (req, res, next) {
    let gameReport_id = req.params.id;
    connection.query("SELECT * from gameReport where id = ?", gameReport_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});


//  Update GameReport with id
router.put("/update", function (req, res, next) {
    console.log("GameReport Update", req.body);
    let gameReport_id = req.body.gameReport_id;
    let gameReport = req.body.gameReport;

    if (!gameReport_id || !gameReport) {
        return res.status(400).send({
            err: gameReport,
            message: "Please provide gameReport and gameReport_id"
        });
    }

    connection.query(
        "UPDATE gameReport SET ? WHERE id = ?",
        [gameReport, gameReport_id],
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

// Delete GameReport
router.delete("/delete", function (req, res, next) {
    console.log('Delete GameReport', req.body.data);
    connection.query(
        `DELETE FROM gameReport WHERE id= ${req.body.data.gameReport_id}`,
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

module.exports = router;