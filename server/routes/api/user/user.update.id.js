"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/user.schema")(server);
  const { payload: payloadSchema, params: paramSchema } = Schema.updateByID();
  
  const {
    controllers: {
      user: { updateByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/user/{id}",
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
        payload: payloadSchema,
        params: paramSchema,
      },
    },
  };
};
