var express = require("express"),
  router = express.Router();
mqtt = require("../MQTTWebSockets");
var resources = require("../resources/model");
const { getMode, getCurrentDateToString } = require("../utils/functions");
const { v4: uuidv4 } = require("uuid");

const actionsSensors = {
  fueltanklevel: "fueltanklevel",
  batterychargelevel: "batterychargelevel",
  speed: "speed",
  power: "power",
};

router.route("/actions/power").post(function (req, res, next) {
  var { value } = req.body;
  resources.status = value;
  res.status(200).json(`Vehicle is ${resources.status ? "On" : "Off"}`);
});

router.route("/actions/sensors/:id").post(function (req, res, next) {
  const id = req.params.id;
  var { isEmpty } = req.body;
  let isNotify = isEmpty;
  let sendValue = 0;
  let alertMsg = "";

  switch (id) {
    case actionsSensors.fueltanklevel:
      {
        resources.sensors[0] = {
          ...resources.sensors[0],
          value: isEmpty ? 0 : 55,
          active: !isEmpty,
        };
        sendValue = isEmpty ? 0 : 55;
        alertMsg = isEmpty ? "Fuel Tank Level is low" : "";
      }
      break;
    case actionsSensors.batterychargelevel: {
      resources.sensors[1] = {
        ...resources.sensors[1],
        value: isEmpty ? 0 : 100,
        active: !isEmpty,
      };
      sendValue = isEmpty ? 0 : 100;
      alertMsg = isEmpty ? "Battery charge Level is low" : "";
      break;
    }
  }

  getMode();

  if (isEmpty) {
    resources.alerts.unshift({
      alert: alertMsg,
      value: sendValue,
      name: id,
      date: getCurrentDateToString(),
      id: uuidv4(),
    });
  }

  // Update the sensor value
  mqtt.publish(
    `hybridenginecontrol/sensors/${id}`,
    JSON.stringify({ id: id, value: sendValue, notify: isNotify })
  );

  // Update the mode value
  mqtt.publish(
    `hybridenginecontrol/mode`,
    JSON.stringify({ mode: resources.mode })
  );
  res.status(200).json("Sensor updated successfully.");
});

router.route("/actions/history").get(function (req, res, next) {
  res
    .status(200)
    .json({ alerts: resources.alerts, total: resources.alerts.length });
});

router.route("/actions/history/:id").delete(function (req, res, next) {
  const id = req.params.id;
  console.log("id", id);
  console.log("resources.alerts", resources.alerts);
  const newAlerts = resources.alerts.filter((alert) => alert.id !== id);
  console.log("newAlerts", newAlerts);
  resources.alerts = newAlerts;
  res.status(200).json("Alert deleted successfully.");
});

module.exports = router;
