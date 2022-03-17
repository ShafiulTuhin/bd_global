"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/currency.schema")(server);
  const { payload, params } = Schema.updateByID();

  const {
    controllers: {
      currency: { updateByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/currency/{id}",
    config: {
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: updateByID,
      auth: "jwt",
      validate: {
        payload,
        params
      },
    },
  };
};
