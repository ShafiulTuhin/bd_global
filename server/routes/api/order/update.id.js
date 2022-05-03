"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/order.schema")(server);
  const { params, payload } = Schema.update();
  const {
    controllers: {
      order: { updateByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/order/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: updateByID,
      auth: "jwt",
      validate: {
        params,
        payload,
      },
    },
  };
};
