"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      security: { findByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const schema = Joi.object({
    id: Joi.string().uuid(),
  });

  return {
    method: ["GET"],
    path: "/security/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: findByID,
      validate: {
        params: schema,
      },
      auth: "jwt",
    },
  };
};
