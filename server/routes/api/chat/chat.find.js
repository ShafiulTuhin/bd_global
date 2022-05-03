"use strict";

module.exports = (server) => {
  const {
    controllers: {
      chat: { find },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/chat",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
    },
  };
};
