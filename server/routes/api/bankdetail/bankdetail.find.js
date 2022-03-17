"use strict";

module.exports = (server) => {
  const {
    controllers: {
        bankdetail: { find },
    },
    helpers:{
      permissions:{
        isUser,
      }
    }
  } = server.app;

  return {
    method: "GET",
    path: "/bank-detail",
    config: {
      pre: [
        {
          method:isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
    },
    
  };
};
