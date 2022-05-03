const Joi = require("joi");

module.exports = (server) => {
  const {
    controllers: {
      address: { findByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  let schema = Joi.object().keys({
    id: Joi.string().uuid(),
  });
  return {
    method: "GET",
    path: "/address/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: findByID,
      auth: "jwt",
      validate: {
        params: schema,
      },
    },
  };
};
