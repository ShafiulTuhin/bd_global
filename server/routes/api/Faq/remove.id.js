"use strict";
const joi = require("joi")

module.exports = (server) => {
   
  const {
    controllers: {
      faq: {  removeByID },
    },
    boom,
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const params = joi.object({
    id:joi.string().uuid().required(),
    force:joi.bool().default(false).optional()
  })

  return {
    method: "DELETE",
    path: "/faq/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: removeByID,
      validate: {
        params,
      },
      auth: "jwt",
     
    },
  };
};
