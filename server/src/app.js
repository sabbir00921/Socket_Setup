const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
require("dotenv").config();

const { globalErrorhandaler } = require("./helpers/globalErrorhandaler");
const { serverLiveTemplate } = require("./template/serverLiveTemplate");
const { initSocket } = require("./socket/server");

const server = http.createServer(app);

// Middleware
app.use(
  cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] })
);

app.use(express.json()); // AFTER webhook

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
// Base
app.get("/", (_, res) => {
  res.render("index.ejs");
  // serverLiveTemplate(res);
});

// Routes
app.use("/api/v1", require("./routes/index.api"));

// global error handler
app.use(globalErrorhandaler);

const io = initSocket(server);

module.exports = { server, io };
