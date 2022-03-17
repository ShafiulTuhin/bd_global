"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/advert.schema")(server);
  const { payload } = Schema.update();
  const {
    controllers: {
      advert: { update },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/ad",
    config: {
      pre: [{ method: isUser, assign: "permission" }],
      handler: update,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
