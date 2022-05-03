"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/wallet.schema")(server);
  const { payload } = Schema.create();
  const {
    controllers: {
      wallet: { create },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  

  return {
    method: "POST",
    path: "/wallet",
    config: {
      pre: [
        {
          method: isUser,
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
