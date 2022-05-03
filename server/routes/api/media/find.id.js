"use strict";

module.exports = (server) => {
  const {
    controllers: {
      upload: { findByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/media/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: findByID,
      auth: "jwt",
    },
  };
};
