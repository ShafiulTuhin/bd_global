"use strict";

module.exports = (server) => {
  const Schemas = require("../../../schema/kyc.schema")(server);
  const { payload } = Schemas.create();
  const {
    controllers: {
      kyc: { create },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/kyc",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: create,
      auth: "jwt",
      validate: { payload },
    },
  };
};
