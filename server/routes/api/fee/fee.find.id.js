"use strict";
const Joi = require("joi");

module.exports = (server) => {
  /*   const Schema = require("../../_schema/currency.schema");
  const { payload: payloadSchema } = Schema.bulkRetrieve(server);
 */
  const {
    controllers: {
      fee: { findByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  const params = Joi.object().keys({
    id: Joi.string()
      .uuid()
      .required(),
  });
  return {
    method: "GET",
    path: "/fee/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: findByID,
      auth: { strategy: "jwt", mode: "optional" },

      validate: { params },
    },
  };
};
