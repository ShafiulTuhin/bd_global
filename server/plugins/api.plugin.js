const glob = require("glob");
const path = require("path");

module.exports = {
  register(HapiServer, options) {
    /**************************************
     * dynamically register API routes
     **************************************/
    let routes = glob.sync("/routes/api/[!_]**/[!_]*.js", {
      root: path.join(__dirname, ".."),
    });
    routes.forEach((file) => {
      let filePath = require(file);
      HapiServer.route(filePath(HapiServer));
    });
  },
  name: "api",
  once: true,
};
