"use strict";
const Joi = require("joi");
module.exports = (server) => {
  const {
    controllers: {
      secession: { removeByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.object({
    id: Joi.string().uuid(),
  });
  
  return {
    method: "DELETE",
    path: "/secession/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: removeByID,
      auth: "jwt",
      validate: {
        params: schema,
      },
    },
  };
};
