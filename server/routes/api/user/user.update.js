"use strict";
const Joi = require("joi");
module.exports = (server) => {
  const Schema = require("../../../schema/user.schema")(server);
  const { payload: payloadSchema } = Schema.update();
  
  const {
    controllers: {
      user: { update },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;

  return {
    method: "PUT",
    path: "/user",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: update, 
      auth: "jwt",
      validate: { payload: payloadSchema },
    },
  };
};
