"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      kyc: { find },
    },
    consts: { KYC_STATUSES, KYC_TYPES },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;
  const query = Joi.object()
    .keys({
      sudo: Joi.string().optional(),
      fake: Joi.string().optional(),
      limit: Joi.number()
        .integer()
        .optional(),
      where: Joi.object().keys({
        status: Joi.string().allow(Object.values(KYC_STATUSES).join(",")),
        type: Joi.string().allow(Object.values(KYC_TYPES).join(",")),
        user_id: Joi.string().uuid(),
      }),
      order: Joi.string().optional()
    })
    .allow({});

  return {
    method: "GET",
    path: "/kyc",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
      validate: { query },
    },
  };
};
