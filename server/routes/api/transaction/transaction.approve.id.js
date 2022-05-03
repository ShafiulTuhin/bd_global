"use strict"
const Joi = require("joi");

module.exports = (server) => {
  const {
    boom,
    controllers: { transaction: {approveTrnById} },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.object({
    id: Joi.string(),
  });

  return {
    method: "POST",
    path: "/transaction/{id}/approve",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: approveTrnById,
      auth: "jwt",
      validate: {
        params: schema,
      },
    },
  };
};
