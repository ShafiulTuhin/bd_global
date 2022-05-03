"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      notification: { find },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  let query = Joi.object().keys({
    pending:Joi.boolean().default(false)
  })

  

  return {
    method: "GET",
    path: "/notification",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
      validate: {
        query,
      },
    },
  };
};
