const express = require("express");
const { updateMe, getUsers } = require("../controller/user");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.patch("/update-me", protect, updateMe);
router.post("/get-users", protect, getUsers);

module.exports = router;
