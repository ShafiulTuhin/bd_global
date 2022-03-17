"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/wallet.schema")(server);
  const { params } = Schema.findByAddress()
  const {
    controllers: {
      wallet: { findByAddress },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  
  return {
    method: "GET",
    path: "/wallet/{address}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: findByAddress,
      auth: "jwt",
      validate: {
        params
      }
    },
  };
};
