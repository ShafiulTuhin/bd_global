"use strict";

module.exports = (server) => {
  const Schema = require("../../../schema/secession.schema")(server);
  const { payload, params } = Schema.updateByID();
  const {
    controllers: {
      secession: { updateByID },
    },
    consts: { SECESSION_STATUSES },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/secession/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: updateByID,
      auth: "jwt",
      validate: {
        payload,
        params,
      },
    },
  };
};
