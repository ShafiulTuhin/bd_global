"use strict";

module.exports = (server) => {
  // const Schema = require("../../../schema/analytics.schema");
  // const { payload: payloadSchema } = Schema.authenticate(server);

  const {
    controllers: {
      analytics: { securityAnalytics },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/analytics/security",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: securityAnalytics,
      auth: "jwt",
      // validate: {
      //   payload: payloadSchema,
      // },
    },
  };
};
