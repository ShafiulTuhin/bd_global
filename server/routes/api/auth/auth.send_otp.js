"use strict";

const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      auth: { sendOTP },
    },
    boom,
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  // define Joi schema
  const payload = Joi.object().keys({
    id: Joi.string()
      .uuid()
      .error(boom.badRequest("ID is invalid")),
    email: Joi.string()
      .email()
      .error(boom.badRequest("Email address payload is missing or invalid")),
    phone: Joi.string()
      .error(boom.badRequest("Phone number payload is missing or invalid")),
    type: Joi.string().valid('email', 'phone').allow('')
      .error(boom.badRequest("Type payload is missing or invalid")),
  });

  return {
    method: "POST",
    path: "/auth/send/otp",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: sendOTP,
      validate: {
        payload,
      },
      auth: { strategy: "jwt", mode: "optional" },
    },
  };
};
