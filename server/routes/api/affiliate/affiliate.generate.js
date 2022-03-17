"use strict";

module.exports = (server) => {
  const {
    controllers: {
      affiliate: { generateLink },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/affiliate/generate",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: generateLink,
      auth: "jwt",
    },
  };
};
