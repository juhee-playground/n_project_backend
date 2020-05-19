const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function(req, res, next) {
  res.send("Update Member World");
});

// Create Member
router.post("/create", function(req, res, next) {
  var memberData = req.body;
  // memberData.created_at = new Date();
  console.log(memberData);
  connection.query("INSERT INTO member SET ?", memberData, function(
    err,
    results,
    fields
  ) {
    if (err) next(err);

    console.log(results.insertId);
    res.send(JSON.stringify(results));
  });
});

// Read Member
router.get("/list", function(req, res, next) {
  connection.query("SELECT * from member", function(err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Retrieve member with id
router.get("/:id", function(req, res, next) {
  let member_id = req.params.id;
  if (!member_id) {
    return res.status(400).send({
      err: true,
      message: "Please provide member_id"
    });
  }
  connection.query("SELECT * FROM member where id=?", member_id, function(
    err,
    results,
    fields
  ) {
    if (err) next(err);
    res.send(results[0]);
  });
});

//  Update member with id
router.put("/update", function(req, res, next) {
  let member_id = req.body.member_id;
  let member = req.body.member;

  console.log(req.body);
  if (!member_id || !member) {
    return res.status(400).send({
      err: member,
      message: "Please provide member and member_id"
    });
  }

  connection.query(
    "UPDATE member SET ? WHERE id = ?",
    [member, member_id],
    function(err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

// Delete Member
router.delete("/delete", function(req, res, next) {
  console.log(req.body);
  connection.query(
    "DELETE FROM member WHERE id=?",
    [req.body.member_id],
    function(err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

module.exports = router;
