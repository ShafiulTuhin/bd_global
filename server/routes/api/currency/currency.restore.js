"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/currency.schema")(server);
  const { payload } = Schema.restore();

  const {
    controllers: {
      currency: { restore },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PATCH",
    path: "/currency",
    config: {
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: restore,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
