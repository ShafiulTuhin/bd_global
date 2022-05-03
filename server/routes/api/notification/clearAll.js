"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      notification: { clearAll },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;



  return {
    method: "DELETE",
    path: "/notification",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: clearAll,
      auth: "jwt"
    },
  };
};
