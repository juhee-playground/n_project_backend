const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res) {
  res.send("Update Schdeule World");
})

// Create Schedule
router.post("/create", function (req, res) {
  var scheduleData = req.body;

  console.log(scheduleData);
  connection.query("INSERT INTO schedule set ?", scheduleData, function (
    err,
    results,
    fields
  ) {
    if (error) {
      console.error(error)
      res.status(500).send({
        error: true,
        content: error,
        message: 'Something broke'
      })
    }
    console.log(RTCDtlsTransportStateChangedEvent.insertId);
    res.send(JSON.stringify(results));
  });
});


module.exports = router;