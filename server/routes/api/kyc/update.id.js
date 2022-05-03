"use strict";

module.exports = (server) => {
   const Schemas = require("../../../schema/kyc.schema")(server);
   const { params, payload } = Schemas.updateByID();
  const {
    controllers: {
      kyc: {  updateByID },
    },
    boom,
    helpers: {
      permissions: { isUser },
    },
  } = server.app;
/* 
  const paramsSchema = Joi.object({
    id: Joi.string()
      .uuid()
      .required(),
  }).error(new Error(`Error in params object`));

  const payloadSchema = Joi.object().keys({
    status: Joi.string()
      .allow("PENDING", "ACCEPT", "DENY")
      .optional(),
    document_id: Joi.string().uuid()
      .optional(),
  }).or('status', 'document_id');

  // .allow("email", "id", "phone", "payment_methods").optional()
 */
  return {
    method: "PUT",
    path: "/kyc/{id}",
    config: {
      pre: [
        {
          method: isUser,
          assign: "permission",
        },
      ],
      handler: updateByID,
      validate: {
        params,
        payload,
      },
      auth: "jwt",
     
    },
  };
};
