const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Update attend World");
});

// Read attendance count 
router.post("/count/threeMonths", function (req, res, next) {
  console.log(req.body);
  let date = req.body.standard_date;
  let beforeDate = req.body.before_date;

  let query = `select member.name, member.id, COUNT(attend.schedule_id) as count \
                from attend \
                  join  \
                  (select * from schedule where date_format(schedule.date, '%Y%m') >= ? and date_format(schedule.date, '%Y%m') < ?) as schedule \
                    on attend.schedule_id = schedule.id	\
                    right join member \
                  on member.id = attend.member_id \
                  GROUP BY member.id order by count desc`
  let dataList = [beforeDate, date]
  connection.query(query, dataList, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Read attendance count 
router.post("/countByYear", function (req, res, next) {

  let query = `select member.id, member.name, count(*) as count, date_format(schedule.date, '%Y') as year \
                from attend \
                join schedule \ 
                  on attend.schedule_id = schedule.id	\
                right join member \
                  on member.id = attend.member_id \
                GROUP BY member.id, year order by count desc`
  connection.query(query, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

// Read attendance count 
router.get("/allCount", function (req, res, next) {
  let query = "SELECT count(id) as count, date_format(date, '%Y') as year \
                      FROM nnnn.schedule \
                      group by year"
  connection.query(query, function (err, results, fields) {
    if (err) next(err);
    res.send(results);
  });
});

router.get("/getattendList/:id", async function (req, res, next) {
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
              where at.schedule_id = ? \
              and at.member_id = mb.id`
  let dataList = [schedule_id]
  try{
    const promisePool = connection.promise();
    const [rows, fields] = await promisePool.query(query, dataList);
    res.send(rows);
  }catch (exception){
    next(exception);
  }
});

// Delete Attend
router.delete("/delete", function (req, res, next) {
  console.log('Delete attend', req.body);
  let query = `DELETE FROM attend WHERE member_id= ? and schedule_id = ?`
  let dataList = [req.body.member_id, req.body.schedule_id]
  connection.query(
    query, dataList,
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