var express = require("express"),
  router = express.Router();
mqtt = require("../MQTTWebSockets");
var resources = require("../resources/model");
const basicStats = require("../utils/constants");

router.route("/actions/enabled").post(function (req, res, next) {
  var { value } = req.body;
  console.log("valor", value);
  resources.status = value;
  res.status(200).json(`Vehicle is ${resources.status ? "On" : "Off"}`);
});

router.route("/actions/emptytank").post(function (req, res, next) {
  if (resources.sensors.length > 0) {
    resources.sensors[0] = { ...resources.sensors[0], value: 0, active: false };
  }

  const newDate = new Date();
  const formattedDate = newDate.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  resources.alerts.unshift({
    alert: "Fuel Tank Level is low",
    value: 0,
    name: "fueltanklevel",
    date: formattedDate,
    id: resources.alerts.length,
  });
  res.status(200).json(`The vehicle's tank is empty.`);
});

router.route("/actions/drainbattery").post(function (req, res, next) {
  if (resources.sensors.length > 1) {
    resources.sensors[1] = { ...resources.sensors[1], value: 0, active: false };
  }
  const newDate = new Date();
  const formattedDate = newDate.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  resources.alerts.unshift({
    alert: "Battery Charge Level is low",
    value: 0,
    name: "batterychargelevel",
    date: formattedDate,
    id: resources.alerts.length,
  });
  res.status(200).json(`The vehicle's battery is discharged.`);
});

router.route("/actions/history").get(function (req, res, next) {
  res
    .status(200)
    .json({ alerts: resources.alerts, total: resources.alerts.length });
});

router.route("/actions/history/:id").delete(function (req, res, next) {
  const id = req.params.id;
  const newAlerts = resources.alerts.filters((alert) => alert.id !== id);
  resources.alerts = newAlerts;
  res.status(200).json("Alert deleted successfully.");
});

module.exports = router;
