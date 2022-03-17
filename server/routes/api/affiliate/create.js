"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      affiliate: { create },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const schema = Joi.object({
    invite_code: Joi.string()
      .min(5).max(10)
      .required(),
  });

  return {
    method: "POST",
    path: "/affiliate",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload: schema,
      },
    },
  };
};
