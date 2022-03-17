"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/currency.schema")(server);
  const { payload } = Schema.create();

  const {
    controllers: {
      currency: { create },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "POST",
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
      handler: create,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
