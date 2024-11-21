var httpServer = require("./servers/http-server");
var resources = require("./resources/model");

httpServer.listen(resources.port, function () {});
