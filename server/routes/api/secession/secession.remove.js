"use strict";
const Joi = require("joi");
module.exports = (server) => {
  const {
    controllers: {
      secession: { remove },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.array().items(Joi.string().uuid());

  return {
    method: "DELETE",
    path: "/secession",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: remove,
      auth: "jwt",
      validate: {
        payload: schema,
      },
    },
  };
};
