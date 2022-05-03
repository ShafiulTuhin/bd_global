"use strict";

module.exports = (server) => {
  // const Schema = require("../../../schema/analytics.schema");
  // const { payload: payloadSchema } = Schema.authenticate(server);

  const {
    controllers: {
      analytics: { kycAnalytics },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/analytics/kyc",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: kycAnalytics,
      auth: "jwt",
      // validate: {
      //   payload: payloadSchema,
      // },
    },
  };
};
