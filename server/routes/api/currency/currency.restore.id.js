"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/currency.schema")(server);
  const { params } = Schema.restoreByID();

  const {
    controllers: {
      currency: { restoreByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/currency/{id}/restore",
    config: {
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: restoreByID,
      auth: "jwt",
      validate: {
        params,
      },
    },
  };
};
