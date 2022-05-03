"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      kyc: { findByID },
    },
    boom,
    consts: { KYC_STATUSES, KYC_TYPES },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const paramsSchema = Joi.object({
    id: Joi.string()
      .uuid()
      .required(),
  }).error(new Error(`Error in params object`));

  const query= Joi.object()
    .keys({
      sudo: Joi.string().optional(),
      fake: Joi.string().optional(),
      limit: Joi.number()
        .integer()
        .optional(),
      where: Joi.object().keys({
        status: Joi.string().allow(Object.values(KYC_STATUSES).join(",")),
        type: Joi.string().allow(Object.values(KYC_TYPES).join(",")),
      }),
    })
    .allow({});
  return {
    method: "GET",
    path: "/kyc/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: findByID,
      validate: {
        params: paramsSchema,
        query,
      },
      auth: "jwt",
    },
  };
};
