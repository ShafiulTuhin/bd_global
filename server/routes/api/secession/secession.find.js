"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/secession.schema")(server);
  const { query } = Schema.find();
  const {
    controllers: {
      secession: { find },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/secession",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
      validate: {
        query,
      },
    },
  };
};
