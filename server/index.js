"use strict";
const env = process.env.NODE_ENV || "development";
const config = require("dotenv").config({
  path: "../.env",
});
// if (env === "development") console.log({ parsedEnv: config.parsed });
if (config.error) {
  throw config.error;
}

module.exports = (async () => {
  const server = await require("./server");

  const { start } = server;
  const app = await start();
  return app;
})();

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});
