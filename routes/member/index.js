const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function(req, res) {
  res.send("Update Member World");
});

// Create Member
router.post("/create", function(req, res) {
  var memberData = req.body;
  // memberData.created_at = new Date();
  console.log(memberData);
  connection.query("INSERT INTO member SET ?", memberData, function(
    err,
    results,
    fields
  ) {
    if (err) {
      console.error(err, results);
      res.send(err, results);
    }
    console.log(results.insertId);
    res.send(JSON.stringify(results));
  });
});

// Read Member
router.get("/members/", function(req, res) {
  connection.query("SELECT * from member", function(err, results, fields) {
    if (err) {
      res.send(
        JSON.stringify({
          status: 500,
          error: error,
          response: null
        })
      );
    } else {
      res.send(results);
    }
  });
});

// Retrieve member with id
router.get("/members:id", function(req, res) {
  let member_id = req.params.id;
  if (!member_id) {
    return res.status(400).send({
      error: true,
      message: "Please provide member_id"
    });
  }
  connection.query("SELECT * FROM member where id=?", member_id, function(
    error,
    results,
    fields
  ) {
    if (error) throw error;
    return res.send({
      error: false,
      data: results[0],
      message: "members details."
    });
  });
});

//  Update member with id
router.put("/update", function(req, res) {
  let member_id = req.body.member_id;
  let member = req.body.member;

  console.log(req.body);
  if (!member_id || !member) {
    return res.status(400).send({
      error: member,
      message: "Please provide member and member_id"
    });
  }

  connection.query(
    "UPDATE member SET ? WHERE id = ?",
    [member, member_id],
    function(error, results, fields) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results,
        message: "member has been updated successfully."
      });
    }
  );
});

// Delete Member
router.delete("/delete", function(req, res) {
  console.log(req.body);
  connection.query(
    "DELETE FROM member WHERE id=?",
    [req.body.member_id],
    function(error, results, fields) {
      if (error) throw error;
      res.send("Record has been deleted!");
    }
  );
});

module.exports = router;
