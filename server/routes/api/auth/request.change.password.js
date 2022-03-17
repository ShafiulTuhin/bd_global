"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.requestPasswordChange();

  const {
    controllers: {
      auth: { requestPasswordChange },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/request/change/password",
    config: {
      handler: requestPasswordChange,
      validate: {
        payload,
      },
    },
  };
};
