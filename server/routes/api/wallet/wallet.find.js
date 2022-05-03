"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const Schema = require("../../../schema/wallet.schema")(server);
  const { query } = Schema.find();
  const {
    controllers: {
      wallet: { find },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/wallet",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
      validate: { query },
    },
  };
};
