"use strict";

module.exports = (server) => {

 
  const {
    controllers: {
      logger: { find },
    },
   helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/logger",
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
