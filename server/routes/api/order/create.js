"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/order.schema")(server);
  const { payload } = Schema.create();

  const {
    controllers: {
      order: { create },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/order",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
