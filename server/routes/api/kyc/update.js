"use strict";
module.exports = (server) => {
  const Schemas = require("../../../schema/kyc.schema")(server);
  const { payload } = Schemas.update();
  const {
    controllers: {
      kyc: { update },
    },
    boom,
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/kyc",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: update,
      validate: {
        payload: payload,
      },
      auth: "jwt",
    },
  };
};
