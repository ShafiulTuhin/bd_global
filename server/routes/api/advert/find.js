"use strict";

module.exports = (server) => {
  let Schema = require('../../../schema//advert.schema')(server);
  const { query } = Schema.find();

  const {
    controllers: {
      advert: { find },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/ad",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: { strategy: "jwt", mode: "optional" },
      validate: { query }
    },
  };
};
