const express = require("express");
const connection = require("../../custom_lib/db_connection");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const encrypt = require("../../config/encrypt");
const secret = encrypt.secret;
const router = express.Router();
const authMiddleware = require("../../custom_lib/auth_middleware");
const e = require("express");

router.get("/", function (req, res, next) {
  res.send("Update userHistory!!");
});

function aaa() {}

// Create Member
router.post("/create", function(req, res, next) {
  var historyData = req.body;
  connection.query("INSERT INTO userHistory SET ?", historyData, function(
    err,
    results,
    fields
  ) {
    if (err) next(err);

    console.log(results);
    res.send(JSON.stringify(results));
  });
});

module.exports = router;
