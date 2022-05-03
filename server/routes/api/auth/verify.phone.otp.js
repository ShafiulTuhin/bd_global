"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      auth: { verifySMSOTP },
    },
    helpers: {
      permissions: { isUser },
    },
    boom,
  } = server.app;

  // define Joi schema
  const payload = Joi.object({
    phone: Joi.string()
      .required()
      .error(boom.badRequest("<phone> is invalid or missing")),
    code: Joi.string()
      .length(6)
      .required()
      .error(boom.badRequest("<code::string(6)> is invalid")),
  });

  return {
    method: ["PUT", "POST"],
    path: "/auth/verify/phone/{type?}",
    config: {
      pre: [
        [
          {
            method: isUser,
            assign: "permission",
          },
        ],
      ],
      handler: (req) => {
        const {
          params: { type },
        } = req;

        switch (type) {
          case "otp":
          default: {
            return verifySMSOTP(req);
          }
        }
      },
      auth: {
        mode: "optional",
        strategy: "jwt",
      },
      validate: {
        payload,
      },
    },
  };
};
