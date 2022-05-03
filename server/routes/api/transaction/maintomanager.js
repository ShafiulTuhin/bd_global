"use strict";


module.exports = (server) => {
  // const Schema = require("../../../schema/airdrops.schema")(server);
  // const { payload } = Schema.create();
  const Joi = require("joi");

  const {
    controllers: {
      transaction: { mainToManagerTransfer },
    },
    boom,
    consts: { SUPPORTED_TOKENS },
    helpers: {
      permissions: { isAdminOrError },
    },
  } = server.app;

  const schema = Joi.object({
    currency: Joi.string()
      .valid(...Object.keys(SUPPORTED_TOKENS))
      .error(boom.badRequest(`<crypto::string> is invalid`)),
    amount: Joi.number().error(
      boom.badRequest(`<amount::number> is invalid`)
    ),
    to: Joi.string()
      .allow("")
      .error(
        boom.badRequest(`Input <to::string> is required`)
      ),
    tag: Joi.number().allow("").error(
      boom.badRequest(`<tag::number> is invalid`)
    ),
  });

  // console.log('ggg');
  // return false
  return {
    method: "POST",
    path: "/transaction/maintomanager",
    config: {
      pre: [
        [
          {
            method: isAdminOrError,
            assign: "permission",
          },
        ],
      ],
      handler: mainToManagerTransfer,
      auth: "jwt",
      validate: {
        payload: schema,
      },
    },
  };
};
