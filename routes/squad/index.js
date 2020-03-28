const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
    res.send("Hello squad World");
});

// Create Squad
router.post("/create", function (req, res, next) {
    var squadData = req.body;

    console.log('Create Squad', squadData);
    connection.query("INSERT INTO squad SET ?", squadData, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

// Read Squad
router.get("/list", function (req, res, next) {
    connection.query("SELECT * from squad", function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//Read selected Squad
router.get("/getinfo/:id", function (req, res, next) {
    let squad_id = req.params.id;
    connection.query("SELECT * from squad where id = ?", squad_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//  Update Squad with id
router.put("/update", function (req, res, next) {
    let squad_id = req.body.id;
    let squad = req.body.squad;

    console.log(req.body);
    if (!squad_id || !squad) {
        return res.status(400).send({
            err: squad,
            message: "Please provide squad and squad_id"
        });
    }

    connection.query(
        "UPDATE squad SET ? WHERE id = ?",
        [squad, squad_id],
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

// Delete Squad
router.delete("/delete", function (req, res, next) {
    console.log('Delete Squad', req.body);
    connection.query(
        `DELETE FROM squad WHERE id= ${req.body.squad_id}`,
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

module.exports = router;