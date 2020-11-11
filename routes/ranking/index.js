const express = require("express");
const router = express.Router();

const common = require("./common");
router.use("/", common)

const personal = require("./personal");
router.use("/", personal)

module.exports = router;