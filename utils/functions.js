var resources = require("../resources/model");
const { basicStats } = require("./constants");

const getCurrentDateToString = () => {
  const newDate = new Date();
  const formattedDate = newDate.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return formattedDate;
};

const getMode = () => {
  if (!resources.status) {
    resources.mode = "Inactive";
    return;
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
    resources.mode = "Electric";
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
};

module.exports = { getCurrentDateToString, getMode };
