"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/advert.schema")(server);
  
  const { payload } = Schema.create();

  const {
    controllers: {
      advert: { create },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/ad",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: create,
      validate: {
        payload,
      },
      auth: "jwt",
    },
  };
};
