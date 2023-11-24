const express = require("express");
const {
  updateMe,
  getUsers,
  getFriends,
  getFriendRequest,
} = require("../controller/user");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.patch("/update-me", protect, updateMe);
router.get("/get-users", protect, getUsers);
router.get("/get-friends", protect, getFriends);
router.get("/get-friend-request", protect, getFriendRequest);

module.exports = router;
