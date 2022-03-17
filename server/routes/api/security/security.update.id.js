"use strict";
const Joi = require('joi');

module.exports = (server) => {
  const {
    controllers: {
      security: { updateByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const params = Joi.object({
    id: Joi.string().uuid(),
  });

  return {
    method: ["PUT"],
    path: "/security/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: updateByID,
      auth: "jwt",
      validate: {
        params,
      },
    },
  };
};
