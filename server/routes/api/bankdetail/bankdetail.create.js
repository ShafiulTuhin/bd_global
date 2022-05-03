"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/bankdetail.schema")(server);
  const { payload } = Schema?.create();

  const {
    controllers: {
      bankdetail: { create },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/bank-detail",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
