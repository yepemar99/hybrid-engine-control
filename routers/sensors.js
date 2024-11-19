var express = require("express"),
  router = express.Router();
mqtt = require("../MQTTWebSockets");
var resources = require("../resources/model");
const basicStats = require("../utils/constants");

router.route("/mode").post(function (req, res, next) {
  var { id, value } = req.body;

  if (!resources.status) {
    resources.mode = "Inactive";
    mqtt.publish(
      `hybridenginecontrol/mode`,
      JSON.stringify({ mode: resources.mode })
    );
    return res.status(200).json({ mode: resources.mode });
  }

  const fueltanklevel = resources.sensors[0].value;
  const batterychargelevel = resources.sensors[1].value;
  const speed = resources.sensors[2].value;
  const power = resources.sensors[3].value;

  if (batterychargelevel === 0 && fueltanklevel === 0) {
    resources.mode = "Inactive";
  }
  if (batterychargelevel === 0 && fueltanklevel > 0) {
    resources.mode = "Combustion";
  }
  if (fueltanklevel === 0 && batterychargelevel > 0) {
    resources.mode = "ELectric";
  }
  if (fueltanklevel > 0 && batterychargelevel > 0) {
    if (speed <= basicStats.LOW_SPEED && power <= basicStats.LOW_POWER) {
      resources.mode = "Electric";
    } else if (
      speed >= basicStats.HIGH_SPEED ||
      power >= basicStats.HIGH_POWER
    ) {
      resources.mode = "Combustion";
    } else {
      resources.mode = "Hybrid";
    }
  }
  mqtt.publish(
    `hybridenginecontrol/mode`,
    JSON.stringify({ mode: resources.mode })
  );
  res.status(200).json({ mode: resources.mode });
});

router.route("/sensors/:id").post(function (req, res, next) {
  var { value } = req.body;
  const id = req.params.id;

  // Check if the sensor is active
  const findIndexSensor = resources.sensors.findIndex(
    (sensor) => sensor.id === id
  );

  // If the sensor is not active, the value is not updated
  if (id === "fueltanklevel") {
    console.log(resources.sensors[findIndexSensor].value);
    console.log("resources", resources.sensors[findIndexSensor]);
  }
  let sendValue =
    !resources.status || !resources.sensors[findIndexSensor].active
      ? resources.sensors[findIndexSensor].value
      : value;
  if (id === "fueltanklevel") {
    console.log("sendValue", sendValue);
    console.log("value", value);
  }
  resources.sensors[findIndexSensor].value = sendValue;

  let isNotify = false;

  // Alert if the fuel tank level or battery charge level is low
  if (
    (id === "fueltanklevel" && sendValue < basicStats.LOW_FUEL_TANK_LEVEL) ||
    (id === "batterychargelevel" &&
      sendValue < basicStats.LOW_BATTERY_FUEL_CHARGE)
  ) {
    const newDate = new Date();
    const formattedDate = newDate.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

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
        date: formattedDate,
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
  res.status(201).send(JSON.stringify({ value: sendValue }));
});

module.exports = router;
