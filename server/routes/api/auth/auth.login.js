"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.authenticate();

  const {
    controllers: {
      auth: { authenticate },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/login",
    config: {
      handler: authenticate,
      validate: {
        payload,
      },
    },
  };
};
