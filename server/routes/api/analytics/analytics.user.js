"use strict";

module.exports = (server) => {
  // const Schema = require("../../../schema/analytics.schema");
  // const { payload: payloadSchema } = Schema.authenticate(server);

  const {
    controllers: {
      analytics: { userAnalytics },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/analytics/user",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: userAnalytics,
      auth: 'jwt'
      // validate: {
      //   payload: payloadSchema,
      // },
    },
  };
};
