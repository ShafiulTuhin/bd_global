"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/wallet.schema")(server);
  const { payload } = Schema.withdraw();
  const {
    controllers: {
      wallet: { withdrawAsset },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/wallet/withdraw",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: withdrawAsset,
      auth: "jwt",
      validate: {
        payload
      },
    },
  };
};
