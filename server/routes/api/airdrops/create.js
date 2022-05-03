"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/airdrops.schema")(server);
  const { payload } = Schema.create();

  const {
    controllers: {
      airdrops: { create },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;
// console.log('ggg');return false
  return {
    method: "POST",
    path: "/airdrops",
    config: {
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
