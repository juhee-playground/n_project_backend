const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
    res.send("Hello memberSquad World");
});

// Create memberSquad
router.post("/create", function (req, res, next) {
    var memberSquadData = req.body;

    console.log('Create Squad', memberSquadData);
    connection.query("INSERT INTO memberSquad SET ?", memberSquadData, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

// Create memberSquad
router.post("/createMultiple", function (req, res, next) {
  let memberSquadData = req.body;
  // Remove element whose member_id is null
  memberSquadData = memberSquadData.filter(element => element[1] != null );
  let sql = 'INSERT INTO memberSquad (`squad_id`, `member_id`,`position`) values ?;'
//   var memberSquadData = [
//     [ 7, 2, 'LW'],
//     [ 7, 3, 'FW']
// ];
  console.log('Create memberSquad', memberSquadData);
  connection.query(sql, [memberSquadData], function (err, results, fields) {
      if (err) next(err);
      res.send(results);
  });
});

// Read memberSquad
router.get("/list", function (req, res, next) {
    connection.query("SELECT * from memberSquad", function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//Read selected memberSquad
router.get("/getinfo/:id", function (req, res, next) {
    let memberSquad_id = req.params.id;
    connection.query("SELECT * from memberSquad where id = ?", memberSquad_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

router.get("/getinfoWithSquadId/:id", function (req, res, next) {
    let squad_id = req.params.id;
    connection.query("SELECT memberSquad.position, memberSquad.member_id, memberSquad.squad_id, member.id, member.name from memberSquad join member where memberSquad.squad_id = ? and member.id = memberSquad.member_id", squad_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//  Update memberSquad with id
router.put("/update", function (req, res, next) {
    let memberSquad_id = req.body.id;
    let memberSquad = req.body.memberSquad;

    console.log(req.body);
    if (!memberSquad_id || !memberSquad) {
        return res.status(400).send({
            err: memberSquad,
            message: "Please provide memberSquad and memberSquad_id"
        });
    }

    connection.query(
        "UPDATE memberSquad SET ? WHERE id = ?",
        [memberSquad, memberSquad_id],
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

// Delete memberSquad
router.delete("/delete", function (req, res, next) {
    let searchInfoDict = req.body
    console.log("Delete memberSquad", searchInfoDict)
    if (!searchInfoDict) {
        return res.status(400).send({
            err: searchInfoDict,
            message: "Please provide searchInfoDict"
        });
    }

    connection.query(
        'DELETE FROM memberSquad WHERE ?',
        searchInfoDict,
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

module.exports = router;