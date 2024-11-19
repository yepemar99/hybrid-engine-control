var express = require("express"),
  cors = require("cors"),
  bodyParser = require("body-parser");
var sensorRoutes = require("../routers/sensors");
var actionRoutes = require("../routers/actions");
var converter = require("../middleware/converter");

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/hybridenginecontrol", sensorRoutes);
app.use("/hybridenginecontrol", actionRoutes);
app.use(converter());

module.exports = app;
