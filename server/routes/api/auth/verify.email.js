"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      auth: { verifyEmailByLink, verifyEmailOTP },
    },
    helpers: {
      permissions: { isUser },
    },
    boom,
  } = server.app;

  // define Joi schema
  const payload = Joi.object({
    token: Joi.string().error(
      boom.badRequest("Required input <token::string> is invalid or missing")
    ),
    email: Joi.string()
      .email()
      .required()
      .error(
        boom.badRequest("Required input <email::string> is invalid or missing")
      ),
    code: Joi.string()
      .length(6)
      .error(boom.badRequest("<code::string(6)> is invalid")),
  }).xor("code", "token");

  return {
    method: ["POST"],
    path: "/auth/verify/email/{type?}",
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
          /*  case "otp": {
            return verifyEmailOTP(req);
          } */
          case "link":
          default: {
            return verifyEmailByLink(req);
          }
        }
      },
      validate: {
        payload,
      },
      auth: {
        mode: "optional",
        strategy: "jwt",
      },
    },
  };
};
