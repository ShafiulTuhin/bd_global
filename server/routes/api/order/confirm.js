"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/order.schema")(server);
  const { params } = Schema.confirm();

  const {
    controllers: {
      order: { confirmByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/order/{id}/confirm",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: confirmByID,
      auth: "jwt",
      validate: {
        params,
      },
    },
  };
};
