"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      chat: { create },
    },
    consts: { COUNTRIES },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const schema = Joi.object({
    country: Joi.string()
      .valid(...Object.keys(COUNTRIES))
      .required(),
    visitor_email: Joi.string()
      .email()
      .required(),
  });

  return {
    method: "POST",
    path: "/chat",
    config: {
      pre: [
        [
          {
            method: isUser,
            assign: "permission",
          },
        ],
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload: schema,
      },
    },
  };
};
