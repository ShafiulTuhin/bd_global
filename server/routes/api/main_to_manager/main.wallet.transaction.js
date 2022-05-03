"use strict";

module.exports = (server) => {

  const {
    controllers: {
      manager_transaction: { find },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/mainwallet/transation",
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
