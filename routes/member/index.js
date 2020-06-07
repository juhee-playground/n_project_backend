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

function getClientIp(req) {
  var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // If request was not forwarded
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

// Read Member
router.get("/list", function(req, res, next) {
  let ipAddress = getClientIp(req)
  console.log("asdfadsf", ipAddress)
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
    if (results.length == 0) {
      res.status(400).send({
        err:true, 
        message:"No Result Found"
      }) 
    }
    res.send(results[0]);
    
  });
});

//  Update member with id
router.put("/update", function(req, res, next) {
  let member_id = req.body.member_id;
  let member = req.body.member;

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
  connection.query(
    "DELETE FROM member WHERE id=?",
    [req.body.data.member_id],
    function(err, results, fields) {
      if (err) next(err);
      console.log(results);
      res.send(results);
    }
  );
});

module.exports = router;
