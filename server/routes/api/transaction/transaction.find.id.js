"use strict"
const Joi = require("joi");

module.exports = (server) => {
  const {
    boom,
    controllers: { transaction: {findByID} },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const schema = Joi.object({
    id: Joi.string(),
  });

  const query = Joi.object().keys({
    sudo: Joi.bool().default(false)
  });

  return {
    method: "GET",
    path: "/transaction/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: findByID,
      auth: "jwt",
      validate: {
        params: schema,
        query
      },
    },
  };
};
