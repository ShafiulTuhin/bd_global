"use strict";

module.exports = (server) => {
  let Schema = require('../../../schema/airdrops.schema')(server);
  const { query } = Schema.find();

  const {
    controllers: {
      airdrops: { history },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/airdrops/history",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: history,
      auth: { strategy: "jwt", mode: "optional" },
      // validate: { query }
    },
  };
};
