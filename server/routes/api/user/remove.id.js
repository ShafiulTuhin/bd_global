"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/user.schema")(server);
  const { params: paramsSchema, payload: payloadSchema } = Schema?.removeByID();

  const {
    controllers: {
      user: { removeByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "DELETE",
    path: "/user/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: removeByID,
      auth: "jwt",
      validate: {
        params: paramsSchema,
        payload: payloadSchema,
      },
    },
  };
};
