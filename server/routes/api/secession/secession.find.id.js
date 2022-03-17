"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      secession: { findByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;


  const schema = Joi.object({
    id: Joi.string().uuid(),
  });
  return {
    method: "GET",
    path: "/secession/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: findByID,
      auth: "jwt",
      validate: {
        params: schema,
      },
    },
  };
};
