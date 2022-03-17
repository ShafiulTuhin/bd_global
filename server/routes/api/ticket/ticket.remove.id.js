"use strict";
const Joi = require("joi");
module.exports = (server) => {
  const {
    controllers: {
      support_ticket: { removeByID },
    },
    helpers: {
      permissions: { isUser },
    },
  } = server.app;


  return {
    method: "DELETE",
    path: "/ticket/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: removeByID,
      auth: "jwt",
    },
  };
};
