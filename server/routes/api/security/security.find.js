"use strict"
module.exports = (server) => {
  const {
    controllers: {
      security: { find },
    },
    helpers: { permissions: {isUser} },
  } = server.app;

  return {
    method: "GET",
    path: "/security",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
    },
  };
};
