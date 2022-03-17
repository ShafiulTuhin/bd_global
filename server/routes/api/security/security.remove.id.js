"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      security: { removeByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const params = Joi.object({
    id: Joi.string().uuid(),
  });
  return {
    method: ["DELETE"],
    path: "/security/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: removeByID,
      auth: "jwt",
      validate: {
        params,
      },
    },
  };
};
