"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/bankdetail.schema")(server);
  const { params, payload } = Schema?.update();
  
  const {
    controllers: {
      bankdetail: { updateByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/bank-detail/{id}",
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
        params,
        payload,
      },
    },
  };
};
