const Joi = require("joi");


module.exports = (server) => {
  const {
    boom,
    consts: { FIAT_CURRENCIES,SUPPORTED_TOKENS,FEE_TYPES },
  } = server.app;

  return {
    // CREATE ------------------------------------------------
    /**
     * @ create - Schema validator for creating a single currency entity
     * @returns {Object} validator
     */
    create() {
      const { fiat, crypto, type,amount_in_percent } = this._common();

      return {
        payload: Joi.object({
          fiat: fiat.required(),
          crypto: crypto.required(),
          type: type.required(),
          amount_in_percent: amount_in_percent.required(),
        }),
      };
    },

    // UPDATE ------------------------------------------------

    updateByID() {
      const { fiat, crypto, type,amount_in_percent,id } = this._common();
      return {
        params: Joi.object().keys({ id }),
        payload: Joi.object().keys({
          fiat,
          crypto,
          type,
          amount_in_percent
        }),
      };
    },
    // REMOVE ------------------------------------------------

    remove() {
      return {
        params: Joi.object().keys({ id: this._common()?.id }),
        payload: Joi.object({
          ids: Joi.array()
            .items(this._common().id)
            .error(boom.badRequest(`Required input <ids::Array> is invalid`)),
          force: this._common()?.force?.optional(),
        }).error(
          boom.badRequest(`Required input <payload::Object> is invalid`)
        ),
      };
    },
    removeByID() {
      return {
        params: Joi.object().keys({ id: this._common()?.id }),
        payload: Joi.object()
          .keys({
            force: this._common()?.force?.optional(),
          })
          ?.optional()
          ?.allow(null),
      };
    },
    // RESTORE ------------------------------------------------

    restoreByID() {
      return {
        params: Joi.object().keys({ id: this._common()?.id }),
      };
    },
    /**
     * @function restore
     */
    restore() {
      return {
        payload: Joi.object({
          ids: Joi.array()
            .items(this._common()?.id)
            .error(boom.badRequest(`Required input <data::Array> is invalid`)),
        }),
      };
    },
    /**
     * @function _common - Schema validator for updating a single currency entity
     * @returns
     */
    _common() {
      return {
        id: Joi.string()
          .uuid()
          .error(boom.badRequest(`<id::uuid> is invalid`)),
        fiat: Joi.string().valid(...Object.keys(FIAT_CURRENCIES))
        .error(boom.badRequest(`<fiat> type is invalid, choose one of => ${Object.keys(FIAT_CURRENCIES).join("|")}`)),
        crypto: Joi.string().valid(...Object.keys(SUPPORTED_TOKENS))
        .error(boom.badRequest(`<crypto> type is invalid, choose one of => ${Object.keys(SUPPORTED_TOKENS).join("|")}`)),
        type: Joi.string().valid(...Object.keys(FEE_TYPES))
        .error(boom.badRequest(`<type>  is invalid, choose one of => ${Object.keys(FEE_TYPES).join("|")}`)),
        amount_in_percent: Joi.number()
        .error(boom.badRequest(`<amount_in_percent::float>  is invalid`)),
        force: Joi.boolean()
          .default(false)
          .error(new Error("<force::boolean> is invalid")),
      };
    },
  };
};
