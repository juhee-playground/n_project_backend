const express = require("express");
const connection = require("../../custom_lib/db_connection");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const encrypt = require("../../config/encrypt");
const secret = encrypt.secret;
const router = express.Router();

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
    { name: userData.name }, // 여기에 password가 들어가있으면 token인증시 password를 노출하게 된다 그러므로 넣지말자
    secret,
    {
      expiresIn: "1d", // 하루 5m 은 5분
      issuer: "nnnn.com",
      subject: "userInfo",
    }
  );

  connection.query(
    `SELECT * FROM user WHERE ?`,
    { name: userData.name },
    function (err, results, fields) {
      if (err) next(err);

      const result = JSON.parse(JSON.stringify(results)); // https://stackoverflow.com/questions/31221980/how-to-access-a-rowdatapacket-object

      if (result.length == 0) {
        res.status(500).send("No Matching UserName");
      } else if (result) {
        const decryptedPassword = crypto
          .createHmac("sha1", secret)
          .update(userData.password)
          .digest("base64");
        if (result[0].password !== decryptedPassword) {
          res.status(500).send("Password is Wrong");
        }
      }
      res.cookie("user", token);
      res.send({ token });
    }
  );
});

router.get("/check", function (req, res, next) {
  // read the token from header or url
  const token = req.headers["x-access-token"] || req.query.token;

  // token does not exist
  if (!token) {
    res.status(403).json({
      success: false,
      message: "not logged in",
    });
  }
  // create a promise that decodes the token
  const p = new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });

  // if token is valid, it will respond with its info
  const respond = (token) => {
    res.json({
      success: true,
      info: token,
    });
  };

  // if it has failed to verify, it will return an error message
  const onError = (error) => {
    res.status(403).json({
      success: false,
      message: error.message,
    });
  };

  // process the promise
  p.then(respond).catch(onError);
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
