"use strict";

module.exports = (server) => {
  const Schemas = require("../../../schema/faq.schema")(server);
  const { payload,query } = Schemas.create();
  const {
    controllers: {
      faq: { create },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/faq",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: create,
      auth: "jwt",
      validate: { payload,query },
    },
  };
};
