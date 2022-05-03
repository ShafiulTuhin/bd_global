"use strict";
const joi = require("joi")

module.exports = (server) => {
   
  const {
    controllers: {
      faq: {  remove },
    },
    boom,
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const payload = joi.object({
    ids:joi.array().items(
      joi.string().uuid()
    ).optional(),
    force:joi.bool().default(false).optional()
  })

  return {
    method: "DELETE",
    path: "/faq",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: remove,
      validate: {
        payload,
      },
      auth: "jwt",
     
    },
  };
};
