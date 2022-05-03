"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.register();

  const {
    controllers: {
      auth: { register },
    },
  } = server.app;

  return {
    method: "POST",
    path: `/auth/register`,
    config: {
      handler: register,
      validate: {
        payload,
      },
    },
  };
};
