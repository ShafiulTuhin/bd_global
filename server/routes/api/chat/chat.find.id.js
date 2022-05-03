"use strict";

module.exports = (server) => {
  const {
    controllers: {
      chat: { findByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/chat/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: findByID,
      auth: "jwt",
    },
  };
};
