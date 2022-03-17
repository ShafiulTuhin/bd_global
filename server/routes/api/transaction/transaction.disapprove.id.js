"use strict"
const Joi = require("joi");

module.exports = (server) => {
  const {
    boom,
    controllers: { transaction: {disapproveTrnById} },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.object({
    id: Joi.string(),
  });

  return {
    method: "POST",
    path: "/transaction/{id}/disapprove",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: disapproveTrnById,
      auth: "jwt",
      validate: {
        params: schema,
      },
    },
  };
};
