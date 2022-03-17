"use strict";

module.exports = (server) => {
  const {
    controllers: {
      auth: { logout },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/auth/logout",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: logout,
      auth: "jwt",
    },
  };
};
