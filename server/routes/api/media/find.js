"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/upload.schema")(server);
  const { query } = Schema.find();
  const {
    controllers: {
      upload: { find },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/media",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      // validate: {
      //   query,
      // },
      handler: find,
      auth: "jwt",
    },
  };
};
