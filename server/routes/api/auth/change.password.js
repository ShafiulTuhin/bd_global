"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/auth.schema")(server);
  const { payload } = Schema?.changePassword();

  const {
    controllers: {
      auth: { changePassword },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/change/password",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: changePassword,
      validate: {
        payload,
      },
      auth: { strategy: "jwt", mode: "optional" },
    },
  };
};
