"use strict";
const Hapi = require("@hapi/hapi");
const glob = require("glob");
const path = require("path");
const helpers = require("./helpers");
const database = require("./database/models");
const consts = require("./constants");
const Boom = require("@hapi/boom");
const cwd = path.join(__dirname);
const Qs = require("qs");
const Inert = require("@hapi/inert");
const fs = require("fs");
const { hostname, port, jwt, server_url } = helpers.config;

// General setup
const {
  mailer: { setupMailer },
} = helpers;
const UPLOAD_PATH = consts.FILE_UPLOAD_PATH;

// create folder for upload if not exist
if (!fs.existsSync(UPLOAD_PATH)) fs.mkdirSync(UPLOAD_PATH);

module.exports = (async () => {
  let mailer;

  // Create new hapi server instance
  const HapiServer = Hapi.server({
    host: hostname,
    port,
    routes: {
      cors: true,
      files: {
        relativeTo: path.join(__dirname, "..", "static"),
        // relativeTo: path.join(__dirname, '..', 'client', 'build'),
      },
    },
    query: {
      parser: (query) => Qs.parse(query),
    },
    router: {
      stripTrailingSlash: true,
    },
  });

  mailer = await setupMailer().catch(console.error);

  /**************************************
   *  initialize database
   **************************************/
  await database.sequelize
    .authenticate()
    .then(() => console.log(`Database connected successfully!`));

  await database.sequelize.sync({
    alter: false,
    force: false,
  });

  /**************************************
   *  Global Hapi server app configs
   **************************************/
  HapiServer.app["config"] = helpers.config;
  HapiServer.app["mailer"] = mailer;
  HapiServer.app["db"] = database;
  HapiServer.app["consts"] = consts;
  HapiServer.app["helpers"] = helpers;
  HapiServer.app["boom"] = Boom;
  HapiServer.app["controllers"] = {};

  /**************************************
   * Register socket
   **************************************/
  HapiServer.app["io"] = require("socket.io")(HapiServer.listener, {
    log: true,
  });

  /**************************************
   * Register controllers
   **************************************/
  let controllers = glob.sync("/controllers/*controller.js", {
    root: cwd,
  });
  controllers.forEach((file) => {
    let routeBase = path.basename(file, ".controller.js");
    // console.log("controller base name",routeBase)
    let filePath = require(file);

    HapiServer.app["controllers"][routeBase] = filePath(HapiServer);
  });

  /**************************************
   *  Register auth plugins
   *  Set auth strategy
   * *************************************/
  await HapiServer.register([
    {
      plugin: require("@hapi/jwt"),
      options: {
        name: "jwt",
      },
    },
  ]);
  HapiServer.auth.strategy("jwt", "jwt", jwt);

  /**************************************
   * Server security
   **************************************/
  // server.state('data', {
  //   ttl: null,
  //   isSecure: true,
  //   isHttpOnly: true
  // });

  await HapiServer.register([
    /**************************************
     * Static file handler
     **************************************/
    {
      plugin: Inert,
    },
    /**************************************
     * Chat plugin
     **************************************/
    {
      plugin: require("./plugins/chat.plugin"),
    },
    /**************************************
     * Register API routes
     **************************************/
    {
      plugin: require("./plugins/api.plugin"),
      routes: {
        prefix: "/api",
      },
    },

    /**************************************
     * Register app routes
     **************************************/
    {
      plugin: require("./plugins/app.plugin"),
    },
  ]);

  // HapiServer.route({
  //   method: 'GET',
  //   path: '/media/{file*}',
  //   handler: {
  //     directory: {
  //       path: UPLOAD_PATH
  //     }
  //   }
  // })

  return {
    init: async () => {
      await HapiServer.initialize().then(() => {
        console.log(`Server has been initialized`);
      });
      return HapiServer;
    },

    start: async function() {
      await HapiServer.start().then(() => {
        console.log(`Server is running on ${server_url}`);
      });
      return HapiServer;
    },

    server:{HapiServer} 
  };
})();

/************************************************ */
/* exports.init = async () => {
  await HapiServer.initialize().then(() => {
    console.log(`Server has been initialized`);
  });
  return HapiServer;
};

exports.start = async function() {
  await HapiServer.start().then(() => {
    console.log(`Server is running on ${server_url}`);
  });
  return HapiServer;
};
 */
