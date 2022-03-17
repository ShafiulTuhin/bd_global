const { CLIENT_ROUTES } = require("../constants");
module.exports = {
  register(HapiServer, options) {
    /**************************************
     * Serve static react app
     **************************************/
    const urlPaths = Object?.values(CLIENT_ROUTES).map((path) => path);

    urlPaths.forEach((url) => {
      HapiServer.route({
        method: "GET",
        path: `${url}/{params*}`,
        handler: {
          directory: {
            path: ".",
            redirectToSlash: true,
            lookupCompressed: true,
          },
        },
      });
    });
  },
  name: "app",
  once: true,
};
