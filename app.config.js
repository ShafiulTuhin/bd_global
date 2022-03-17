module.exports = {
  apps: [
    /*    {
      name: "cointc_client",
      autorestart: false,
      script: "yarn client-build",
      //script: "yarn client-dev",
      watch: "./client",
      out_file: ".logs/client.log",
      error_file: ".logs/client.error.log",
    },
*/
    {
      name: "cointc_server",
      autorestart: true,
      script: "yarn server-build",
      watch: "./server",
      out_file: ".logs/server.log",
      error_file: ".logs/server.error.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
