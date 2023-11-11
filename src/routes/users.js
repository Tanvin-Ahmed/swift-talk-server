const express = require("express");
const { updateMe } = require("../controller/user");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.patch("/update-me", protect, updateMe);

module.exports = router;
