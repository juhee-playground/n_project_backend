const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Update attend World");
});


// Read attend count 
router.get("/count", function (req, res, next) {
  let query = "SELECT date_format(schedule.date, '%Y') as year, \
                      member.name, member.id, \
                      count(attend.member_id) as count \
                      FROM attend as attend \
                      INNER JOIN member ON member.id = attend.member_id \
                      INNER JOIN schedule ON schedule.id = attend.schedule_id \
                      GROUP BY member_id, year"

  connection.query(query,
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    });
});

// Read atttnedance count 
router.post("/count/threeMonths", function (req, res, next) {
  console.log(req.body);
  let date = req.body.standard_date;
  let beforeDate = req.body.before_date;

  let query = `select member.name, member.id, COUNT(attend.schedule_id) as count \
                from attend \
                right join member \
                  on member.id = attend.member_id \
                  left join  \
                  (select * from schedule where date_format(schedule.date, '%Y%m') >= ${beforeDate} and date_format(schedule.date, '%Y%m') < ${date}) as schedule \
                    on attend.schedule_id = schedule.id	\
                  GROUP BY member.id order by count desc`

  connection.query(query, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Read atttnedance count 
router.get("/allCount", function (req, res, next) {
  let query = "SELECT count(id) as count, date_format(date, '%Y') as year \
                      FROM nnnn.schedule \
                      group by year"
  connection.query(query, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

router.get("/getattendList/:id", function (req, res, next) {
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

  connection.query(query, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  })
});

// Delete Attend
router.delete("/delete", function (req, res, next) {
  console.log('Delete attend', req.body);
  connection.query(
    `DELETE FROM attend WHERE member_id= ${req.body.member_id} and schedule_id = ${req.body.schedule_id}`,
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});


// Create Attend
router.post("/create", function (req, res, next) {
  var attendData = req.body;

  console.log('Create Attend', attendData);
  connection.query("INSERT INTO attend SET ?", attendData, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

module.exports = router;