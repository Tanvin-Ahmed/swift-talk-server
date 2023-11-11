const express = require("express");
const router = express.Router();
const authRouter = require("./auth");
const userRouter = require("./users");

router.use("/auth", authRouter);
router.use("/user", userRouter);

module.exports = router;
