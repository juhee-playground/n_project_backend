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
  var userData = req.body; // {name, password}
  // jwt 토큰 발생
  const token = jwt.sign(
    { userId: userData.userId }, // 여기에 password가 들어가있으면 token인증시 password를 노출하게 된다 그러므로 넣지말자
    secret,
    {
      expiresIn: "3h", // 하루 5m 은 5분
      issuer: "nnnn.com",
      subject: "userInfo",
    }
  );
  console.log("userData: ", userData);
  connection.query(
    `SELECT * FROM user WHERE ?`,
    { userId: userData.userId },
    function (err, results, fields) {
      if (err) next(err);
      // https://stackoverflow.com/questions/31221980/how-to-access-a-rowdatapacket-object
      const result = JSON.parse(JSON.stringify(results));
      console.log("results::", result);
      if (result.length == 0) {
          res.status(400).send({
            err: "err",
            message: "UserId가 일치하지 않습니다."
          });
      } else if (result) {
        const decryptedPassword = crypto
          .createHmac("sha1", secret)
          .update(userData.password)
          .digest("base64");
        if (result[0].password !== decryptedPassword) {
          res.status(400).send({
            err: "err",
            message: "패스워드가 일치하지 않습니다."
          });
        }else{
          console.log("success !!!!!");
          res.cookie("user", token);
          res.send({ token });
        }
      }
    }
  );
});

router.use("/check", authMiddleware);
router.get("/check", function (req, res, next) {
  res.json({
    success: true,
    info: req.decoded,
  });
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
