"use strict";
const Joi = require("joi");
module.exports = (server) => {
  const {
    controllers: {
      support_ticket: { updateByID },
    },
    consts: { TICKET_PRIORITIES, TICKET_STATUSES },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.object({
    priority: Joi.string()
      .valid(...Object.keys(TICKET_PRIORITIES))
      .optional(),
    subject: Joi.string().optional(),
    status: Joi.string()
      .valid(...Object.keys(TICKET_STATUSES))
      .optional(),
  });

  return {
    method: "PUT",
    path: "/ticket/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: updateByID,
      auth: "jwt",
      validate: {
        payload: schema,
      },
    },
  };
};
