"use strict";
let joi = require("joi");

module.exports = (server) => {
  const Schema = require("../../../schema/order.schema")(server);
  const { params } = Schema.find();

  const payload = joi.object().keys({
    reason: joi.string().required(),
    images: joi
      .array()
      .items(joi.object())
      .optional(),
    description: joi.string().optional(),
  });

  const {
    controllers: {
      order: { disputeOrderByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "POST",
    path: "/order/{id}/dispute",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: disputeOrderByID,
      auth: { strategy: "jwt" },
      validate: {
        params,
        payload,
      },
    },
  };
};
