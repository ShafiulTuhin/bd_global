"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      affiliate: { remove },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.array().items({
    UserId: Joi.string()
      .uuid()
      .required(),
    referrerId: Joi.string()
      .uuid()
      .required(),
  });

  return {
    method: "DELETE",
    path: "/affiliate",
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
