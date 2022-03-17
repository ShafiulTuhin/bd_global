"use strict";
module.exports = (server) => {
  const Schema = require("../../../schema/secession.schema")(server);
  const { payload } = Schema.create();
  const {
    controllers: {
      secession: { create },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/secession",
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
