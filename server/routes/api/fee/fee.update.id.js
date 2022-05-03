"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/fee.schema")(server);
  const { payload, params } = Schema.updateByID();

  const {
    controllers: {
      fee: { updateByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/fee/{id}",
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
