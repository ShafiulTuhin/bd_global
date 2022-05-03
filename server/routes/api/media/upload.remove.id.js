"use strict";

module.exports = (server) => {
   const Schema = require("../../../schema/upload.schema")(server);
   const { payload, params } = Schema.removeByID();
  const {
    controllers: {
      upload: { removeByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "DELETE",
    path: "/media/{id}",
    config: {
      pre: [
        [
          {
            method: isUser,
            assign: "permission",
          },
        ],
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
