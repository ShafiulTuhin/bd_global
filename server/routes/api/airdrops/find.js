"use strict";

module.exports = (server) => {
  let Schema = require('../../../schema/airdrops.schema')(server);
  const { query } = Schema.find();

  const {
    controllers: {
      airdrops: { find },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/airdrops",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: find,
      auth: { strategy: "jwt", mode: "optional" },
      // validate: { query }
    },
  };
};
