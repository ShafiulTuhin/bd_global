"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      faq: { find },
    },
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
      offset: Joi.number()
        .integer()
        .optional(),
      where: Joi.object().keys({
        answer: Joi.string().optional(),
        question: Joi.string().optional(),
        category: Joi.string().optional(),
        subcategory: Joi.string().optional(),
        active: Joi.boolean().optional(),
        link: Joi.string().optional(),
        created_at: Joi.object().optional(),
        updated_at: Joi.object().optional(),
      }).optional(),
    })
    .allow({});

  return {
    method: "GET",
    path: "/faq",
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
