"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      auth: { verifyOTP },
    },
    boom,
  } = server.app;

  // define Joi schema
  const schema = Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .error(boom.badRequest("Required input <id::uuid> is invalid")),
    code: Joi.string()
      .length(6)
      .required()
      .error(boom.badRequest("Required input <code::string(5)> is invalid")),
  });

  return {
    method: "POST",
    path: "/auth/verify/otp",
    config: {
      handler: verifyOTP,
      validate: {
        payload: schema,
      },
    },
  };
};
