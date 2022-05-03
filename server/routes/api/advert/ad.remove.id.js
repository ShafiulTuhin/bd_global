"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/advert.schema")(server);
  const { params, payload } = Schema.removeByID();
  const {
    controllers: {
      advert: { removeByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "DELETE",
    path: "/ad/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: removeByID,
      auth: "jwt",
      validate: {
        params,
        payload,
      },
    },
  };
};
