"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/kyc.schema")(server);
  const { payload, params } = Schema.updateByUserAndType();
  const {
    controllers: {
      kyc: { updateByUserAndType },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/kyc/user/{user_id}/type/{type}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: updateByUserAndType,
      validate: {
        params,
        payload,
      },
      auth: "jwt",
     
    },
  };
};
