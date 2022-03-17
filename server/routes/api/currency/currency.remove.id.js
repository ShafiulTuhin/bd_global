"use strict";
module.exports = (server) => {
  const Schema = require("../../../schema/currency.schema")(server);
  const { payload, params } = Schema.removeByID();

  const {
    controllers: {
      currency: { removeByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "DELETE",
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
      handler: removeByID,
      auth: "jwt",
      validate: {
        payload,
        params,
      },
    },
  };
};
