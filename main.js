var httpServer = require("./servers/http-server");
var webSocketServer = require("./servers/websockets");
var resources = require("./resources/model");

var wotServer = httpServer.listen(resources.port, function () {
  console.info("Your WoT server is up and running on port");
  webSocketServer.listen(wotServer);
});
