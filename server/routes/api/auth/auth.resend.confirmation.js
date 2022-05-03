"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      auth: { resendConfirmationMail },
    },
    boom,
  } = server.app;

  // define Joi schema
  const payload = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .error(
        boom.badRequest("<email::string> is invalid or missing")
      ),
  });

  return {
    method: "POST",
    path: "/auth/confirm/resend",
    config: {
      handler: resendConfirmationMail,
      validate: {
        payload,
      },
    },
  };
};
