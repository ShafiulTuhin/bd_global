"use strict";
const Joi = require("joi");
module.exports = (server) => {
   const Schema = require("../../../schema/upload.schema")(server);
   const { payload } = Schema.remove();
  const {
    controllers: {
      upload: { remove },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;



  return {
    method: "DELETE",
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
      handler: remove,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
