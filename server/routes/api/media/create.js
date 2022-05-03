"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/upload.schema")(server);
  const { payload } = Schema.create();
  const {
    controllers: {
      upload: { create },
    },

    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/media",
    config: {
      pre: [
        [
          {
            method: isUser,
            assign: "permission",
          },
        ],
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload,
      },
      payload: {
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: true,
        maxBytes: 20715200,
      },
    },
  };
};
