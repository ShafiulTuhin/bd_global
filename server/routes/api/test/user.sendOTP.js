"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      test: { sendOTP },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const payload = Joi.object()
    .keys({
      email: Joi.string(),
      phone: Joi.string().alphanum(),
    })
    .or("email", "phone");

  return {
    method: "POST",
    path: "/test/sendOTP",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: sendOTP,
      auth: "jwt",
      validate: {
        payload,
      },
    },
  };
};
