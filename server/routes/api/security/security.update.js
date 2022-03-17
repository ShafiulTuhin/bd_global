"use strict";

module.exports = (server) => {
  const {
    controllers: {
      security: { update },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: ["PUT"],
    path: "/security",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: update,
      auth: "jwt",
    },
  };
};
