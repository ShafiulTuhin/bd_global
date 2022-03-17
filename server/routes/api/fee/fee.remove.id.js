"use strict";
module.exports = (server) => {
  const Schema = require("../../../schema/fee.schema")(server);
  const { payload, params } = Schema.removeByID();

  const {
    controllers: {
      fee: { removeByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "DELETE",
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
      handler: removeByID,
      auth: "jwt",
      validate: {
        payload,
        params,
      },
    },
  };
};
