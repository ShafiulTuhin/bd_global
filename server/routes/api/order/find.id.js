"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/order.schema")(server);
  const { params } = Schema.find();
  
  const {
    controllers: {
      order: { findByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/order/{id}",
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
