"use strict";
const Joi = require("joi");
const { TICKET_PRIORITIES } = require("../../../constants");
module.exports = (server) => {
  const {
    controllers: {
      support_ticket: { create },
    },
    boom, 
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const schema = Joi.object({
    subject: Joi.string()
      .required()
      .error(
        boom.badData(`Required data <subject::string> is missing or invalid`)
      ),
    description: Joi.string()
      .required()
      .error(
        boom.badData(
          `Required data <description::string> is missing or invalid`
        )
      ),
    priority: Joi.string()
      .valid(...Object.keys(TICKET_PRIORITIES))
      .optional()
      .error(
        boom.badData(`optional data <priority::string> is missing or invalid`)
      ),
  });

  return {
    method: "POST",
    path: "/ticket",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: create,
      auth: "jwt",
      validate: {
        payload: schema,
      },
    },
  };
};
