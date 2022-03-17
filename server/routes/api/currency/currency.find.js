"use strict";

module.exports = (server) => {
/*   const Schema = require("../../_schema/currency.schema");
  const { payload: payloadSchema } = Schema.bulkRetrieve(server);
 */
  const {
    controllers: {
      currency: { find },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "GET",
    path: "/currency",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: find,
      auth: { strategy: "jwt", mode: "optional" },
    },
  };
};
