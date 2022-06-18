"use strict";
const env = process.env.NODE_ENV || "development";
const config = require("dotenv").config({
  path: "../.env",
});

var cron = require("node-cron");
// if (env === "development") console.log({ parsedEnv: config.parsed });
if (config.error) {
  throw config.error;
}

module.exports = (async () => {
  const server = await require("./server");

  const {
    controllers: {
      wallet: {
        generateCustodialWallets,
        getCustodialWalletAddress,
        generateTronCustodialWallets,
      },
    },
  } = server?.server?.HapiServer?.app;

  const { start } = server;
  const app = await start();

  // Generate custodial wallet transactiopn hash
  // cron.schedule('0 * * * *', function() {
  //   console.log('every hour');
  //   generateCustodialWallets()
  // })

  cron.schedule("0 * * * *", function() {
    console.log("every hour");
    getCustodialWalletAddress();
  });

  cron.schedule("0 * * * *", function() {
    console.log("every hour");
    generateTronCustodialWallets();
  });

  return app;
})();

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});
