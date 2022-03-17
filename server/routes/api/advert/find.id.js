"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/advert.schema")(server);
  const { params } = Schema.findByID();
  const {
    controllers: {
      advert: { findByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/ad/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: findByID,
      auth: { strategy: "jwt", mode: "optional" },
      validate: {
        params,
      },
    },
  };
};
