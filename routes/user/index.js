const express = require("express");
const connection = require("../../custom_lib/db_connection");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const encrypt = require("../../config/encrypt");
const secret = encrypt.secret;
const router = express.Router();
const authMiddleware = require("../../custom_lib/auth_middleware");

router.get("/", function (req, res, next) {
  res.send("Update user World");
});

// Create Attend
router.post("/register", function (req, res, next) {
  var userData = req.body; // {name, password}
  console.log("userData: ", userData);
  const encryptPassword = crypto
    .createHmac("sha1", secret)
    .update(userData.password)
    .digest("base64");
  userData.password = encryptPassword;
  // create a new user if does not exist
  console.log("Create User", userData);
  connection.query("INSERT INTO user SET ?", userData, function (
    err,
    results,
    fields
  ) {
    if (err) next(err);
    // respond to the client
    res.send(results);
  });
});


// Create Attend
router.post("/login", function (req, res, next) {
    const account = {};
    console.log(req.body);
    account.userId = req.body.userId;
    account.password = req.body.password;
    if (account.userId) {
      connection.query(`SELECT * FROM user WHERE userId = "${account.userId}"`, function (error, results, fields) {
        if (error) {
          console.log(error);
        }
        const decryptedPassword = crypto
          .createHmac("sha1", secret)
          .update(account.password)
          .digest("base64");

        const signature = {
          "header": {
            typ: "JWT",
            alg: "HS256"
          },
          "payload": {
            exp: 1480849147370,
            id: results.userId,
            name: results.name,
            member_id: results.member_id,
            team_id: results.team_id
          }
        };

        if (results.length > 0 && decryptedPassword == results[0].password) {
          const getToken = new Promise((resolve, reject) => {
            jwt.sign(
              signature,
              secret,
              (err, token) => {
                if (err) reject(err)
                resolve(token)
              })
          });
          
          getToken.then(
            token => {
              res.status(200).json({
                "status": 200,
                "message": 'login success',
                "Authorization": token
              });
            }
          );
        }else {
          console.log("password 가 틀림");
          res.status(400).json({
            'status': 400,
            'message': 'password 가 정확하지 않습니다.'
          });
        }
      });
    } else {
      res.status(400).json({
        'status': 400,
        'message': '일치하는 id값이 없습니다.'
      });
    }
});

router.use("/check", authMiddleware);
router.get("/check", function (req, res, next) {
  res.json({
    success: true,
    info: req.decoded,
  });
});

router.get("/dupulicated/:id", function(req, res, next) {
  console.log("req.params.id", req.params.id);
  let userID = req.params.id;
  connection.query("SELECT id FROM user where userId = ?", userID, function(err, results, fields) {
    if(err) next(err);
    res.send(results);
  })
});

// Delete Attend
router.delete("/delete", function (req, res, next) {
  console.log("Delete attend", req.body);
  connection.query(
    `DELETE FROM attend WHERE member_id= ${req.body.member_id} and schedule_id = ${req.body.schedule_id}`,
    function (err, results, fields) {
      if (err) next(err);
      res.send(results);
    }
  );
});

module.exports = router;
