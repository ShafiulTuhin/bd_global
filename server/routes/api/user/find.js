"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/user.schema")(server);
  const { query } = Schema.find();
  const {
    controllers: {
      user: { find },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/user",
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
