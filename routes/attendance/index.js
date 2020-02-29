const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res) {
  res.send("Update attendance World");
});


// Read atttnedance count 
router.get("/count", function (req, res) {
  connection.query("SELECT date_format(schedule.date, '%Y') as year, \
                    member.name, member.id, \
                    count(attend.member_id) as count \
                    FROM attend as attend \
                    INNER JOIN member ON member.id = attend.member_id \
                    INNER JOIN schedule ON schedule.id = attend.schedule_id \
                    GROUP BY member_id, year", function (err, results, fields) {
    if (err) {
      console.error(err)
      res.status(500).send({
        err: true,
        content: err,
        message: 'Something broke'
      })
    } else {
      res.send(results);
    }
  });
});

// Read atttnedance count 
router.post("/count/threeMonths", function (req, res) {
  console.log(req.body);
  let date = req.body.standard_date;
  let beforeDate = req.body.before_date;

  let query = `SELECT member.name, member.id, IFNULL(count(attend.id), 0) as count \
  FROM member LEFT OUTER JOIN attend ON member.id = attend.member_id \
  LEFT OUTER JOIN schedule ON schedule.id = attend.schedule_id \
  where date_format(schedule.date, '%Y%m') >= ${beforeDate} and \
  date_format(schedule.date, '%Y%m') < ${date} \
  GROUP BY member_id \
  order by count desc`

  connection.query(query, function (err, results, fields) {
    if (err) {
      console.error(err)
      res.status(500).send({
        err: true,
        content: err,
        message: 'Something broke'
      })
    } else {
      res.send(results);
    }
  });
});

// Read atttnedance count 
router.get("/allCount", function (req, res) {
  connection.query("SELECT count(id) as count, date_format(date, '%Y') as year \
    FROM nnnn.schedule \
    group by year", function (err, results, fields) {
    if (err) {
      console.error(err)
      res.status(500).send({
        err: true,
        content: err,
        message: 'Something broke'
      })
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

router.get("/getAttendanceList/:id", function (req, res) {
  let schedule_id = req.params.id;
  if (!schedule_id) {
    return res.status(400).send({
      err: true,
      message: "Please provide schedule_id"
    });
  }

  let query = `SELECT * \
              from attend as at \
              join member as mb \
              where at.schedule_id = ${schedule_id}\
              and at.member_id = mb.id`

  connection.query(query, function (
    err,
    results,
    fields
  ) {
    if (err) {
      console.error(err)
      res.status(500).send({
        err: true,
        content: err,
        message: 'Something broke'
      })
    }
    return res.send({
      err: false,
      data: results,
      message: "schedules details."
    });
  })
});



module.exports = router;