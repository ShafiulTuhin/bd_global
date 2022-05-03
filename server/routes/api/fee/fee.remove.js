"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/fee.schema")(server);
  const { payload } = Schema.remove();

  const {
    controllers: {
      fee: { remove },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "DELETE",
    path: "/fee",
    config: {
      response: {
        emptyStatusCode: 204
      },
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: remove,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
