"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      test: { wallet },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  

  return {
    method: "POST",
    path: "/test/wallet",
    config: {
      pre: [
        {
          method: isUser,
          assign: "user",
        },
      ],
      handler: wallet,
      auth: "jwt",
      // validate: {
      //   payload,
      // },
    },
  };
};
