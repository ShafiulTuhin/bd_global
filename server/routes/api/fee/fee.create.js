"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/fee.schema")(server);
  const { payload } = Schema.create();

  const {
    controllers: {
      fee: { create },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/fee",
    config: {
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
