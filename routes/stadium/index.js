const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function(req, res) {
  res.send("Update stadium World");
});

// Read stadium
router.get("/list", function(req, res) {
  connection.query("SELECT * from stadium", function(err, results, fields) {
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

module.exports = router;

