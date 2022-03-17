"use strict";
let Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      support_ticket: { transferByID },
    },
    boom,
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.object({
    /* id: Joi.string()
      .uuid()
      .required()
      .error(boom.badData(`Required data <id::uuid> is missing or invalid`)), */
    to: Joi.string()
      .uuid()
      .required()
      .error(boom.badData(`Required data <to::uuid> is missing or invalid`)),
  });

  return {
    method: "POST",
    path: "/ticket/transfer/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: transferByID,
      auth: "jwt",
      validate: {
        payload: schema,
      },
    },
  };
};
