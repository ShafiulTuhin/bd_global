"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      faq: { findByID },
    },
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
      
    })
    .allow({});
  return {
    method: "GET",
    path: "/faq/{id}",
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
