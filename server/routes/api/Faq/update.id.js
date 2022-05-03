"use strict";

module.exports = (server) => {
   const Schemas = require("../../../schema/faq.schema")(server);
   const { params, payload,query } = Schemas.updateByID();
  const {
    controllers: {
      faq: {  updateByID },
    },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/faq/{id}",
    config: {
      pre: [
        {
          method: isAdminOrError,
          assign: "permission",
        },
      ],
      handler: updateByID,
      validate: {
        params,
        payload,
        query
      },
      auth: "jwt",
     
    },
  };
};
