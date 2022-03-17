"use strict";
const Joi = require("joi");
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require("../../../constants");

module.exports = (server) => {
  const {
    boom,
    controllers: {
      transaction: { find },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const query = Joi.object().keys({
    where: Joi.object({
      type: Joi.any(),
      status: Joi.any(),
    }).optional(),
    order: Joi.string().optional(),
    fake: Joi.bool().default(false),
    sudo: Joi.bool().default(false),
    limit: Joi.number()
      .integer()
      .optional(),
  });

  return {
    method: "GET",
    path: "/transaction",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: "jwt",
      validate: {
        query,
      },
    },
  };
};
