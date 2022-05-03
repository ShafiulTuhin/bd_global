"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/currency.schema")(server);
  const { payload } = Schema.remove();

  const {
    controllers: {
      currency: { remove },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "DELETE",
    path: "/currency",
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
