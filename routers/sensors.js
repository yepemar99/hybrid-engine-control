var express = require("express"),
  router = express.Router();
mqtt = require("../MQTTWebSockets");
var resources = require("../resources/model");
const { basicStats } = require("../utils/constants");
const { getMode, getCurrentDateToString } = require("../utils/functions");

router.route("/sensors/:id").post(function (req, res, next) {
  var { value } = req.body;
  const id = req.params.id;

  // Check if the sensor is active
  const findIndexSensor = resources.sensors.findIndex(
    (sensor) => sensor.id === id
  );

  // If the sensor is not active, the value is not updated
  console.log("status", resources.status);
  console.log("active", resources.sensors[findIndexSensor].active);
  let sendValue =
    !resources.status || !resources.sensors[findIndexSensor].active
      ? resources.sensors[findIndexSensor].value
      : value;

  resources.sensors[findIndexSensor].value = sendValue;
  getMode();

  let isNotify = false;

  // Alert if the fuel tank level or battery charge level is low
  if (
    ((id === "fueltanklevel" && sendValue < basicStats.LOW_FUEL_TANK_LEVEL) ||
      (id === "batterychargelevel" &&
        sendValue < basicStats.LOW_BATTERY_FUEL_CHARGE)) &&
    resources.sensors[findIndexSensor].active
  ) {
    // Check if the alert is already in the list
    const findLastAlert =
      resources.alerts.length > 0
        ? resources.alerts[resources.alerts.length - 1]
        : null;
    if (
      !findLastAlert ||
      (findLastAlert &&
        findLastAlert.name !== id &&
        findLastAlert.value !== sendValue)
    )
      resources.alerts.unshift({
        alert:
          id === "fueltanklevel"
            ? "Fuel Tank Level is low"
            : "Battery Charge Level is low",
        value: sendValue,
        name: id,
        date: getCurrentDateToString(),
        id: resources.alerts.length,
      });
    isNotify = resources.sensors[findIndexSensor].active;
  } else {
    isNotify = false;
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
  res.status(201).send(JSON.stringify({ value: sendValue }));
});

module.exports = router;
