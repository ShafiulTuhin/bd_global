"use strict";

module.exports = (server) => {
  const {
    controllers: {
      chat: { removeByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "DELETE",
    path: "/chat/{id}",
    config: {
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: removeByID,
      auth: "jwt",
    },
  };
};
