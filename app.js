const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const http = require("http");
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
const { envData } = require("./src/config/env-config");
const socketConnection = require("./src/socket");

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

// create socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: envData.client_url,
    methods: ["GET", "POST"],
  },
});

socketConnection(io);

module.exports = { app, server };
