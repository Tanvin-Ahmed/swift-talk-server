const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");
require("./src/db/db");
const indexRouter = require("./src/routes/index");

const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // one hour
  message: "Too many requests from this IP, please try again in an hour",
});

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PATCH", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());
app.use(mongoSanitizer());
app.use(xss());

app.use("/v1", limiter, indexRouter);

express.Router().get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = app;
