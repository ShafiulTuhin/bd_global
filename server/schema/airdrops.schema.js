
const Joi = require('joi');
// const BaseJoi = require('joi');
// const Extension = require('joi-date-extensions');
// const Joi = BaseJoi.extend(Extension);

module.exports = (server) => {
  const {
    consts: { SUPPORTED_TOKENS},
    boom,
  } = server.app;

  const AIRDROP_TYPES = {
    "single" : "Airdrop transaction to specific user",
    "all" : "Airdrop transaction to all users",
    "selected" : "Airdrop transaction to selected users"
  };

  return {
    _common() {
      return {
        id: Joi.string() 
        .uuid()
        .error(boom.badRequest(`<id::uuid> is invalid or missing`)),
        airdrop_type: Joi.string().valid(...Object.keys(AIRDROP_TYPES))
        .error(boom.badRequest(`<airdrop_type> type is invalid, choose one of => ${Object.keys(AIRDROP_TYPES).join("|")}`)),
        user_id: Joi.string()
        // .uuid()
        .error(boom.badRequest(`<user_id::uuid> is invalid`)),
        force: Joi.boolean()
          .default(false)
          .error(new Error("Optional input <force::boolean> is invalid")),        
        amount: Joi.number().error(
          boom.badRequest(`<amount::number> is invalid`)
        ),
        number_of_payment: Joi.number().integer().min(1).error(
          boom.badRequest(`<number_of_payment::number> is invalid or minimum one`)
        ),
        crypto: Joi.string()
          .valid(...Object.keys(SUPPORTED_TOKENS))
          .error(boom.badRequest(`<crypto::string> is invalid`)),
        reason: Joi.string()
          .allow("")
          .error(
            boom.badRequest(`Optional input <reason::string> is invalid`)
          ),
        reason_detail: Joi.string()
          .allow("")
          .error(
            boom.badRequest(`Optional input <reason_detail::string> is invalid`)
          ),

      };
    },
    

    // CREATE ------------------------------------------------
    /**
     * @ create - Schema validator for creating a single currency entity
     * @returns {Object} validator
     */
    create() {
      
      return {
        payload: Joi.object({
          amount: this._common()?.amount.required(),
          crypto: this._common()?.crypto.required(),
          reason: this._common()?.reason.optional(),
          reason_detail: this._common()?.reason_detail.optional(),
          airdrop_type: this._common()?.airdrop_type.required(),
          user_id: Joi.when('airdrop_type', { is: 'single', then: this._common()?.user_id.required()}),
          number_of_payment : this._common()?.number_of_payment.required(),
        }),
      };
    },

    // FIND ------------------------------------------------

    find() {
      return {
        query: Joi.object().keys({
          sudo: Joi.string().optional(),
          fake: Joi.string().optional(),
          limit: Joi
            .number()
            .integer()
            .optional(),
          offset: Joi
            .number()
            .integer()
            .optional(),
          // where: Joi
          //   .object()
          //   .keys({
          //     // user_id: this._common().user_id?.error(boom.badData),
          //     user_id: Joi.any()?.error(boom.badData),
          //     crypto: Joi
          //       .string()
          //       .valid(...Object.keys(SUPPORTED_TOKENS))
          //       .error(boom.badData),
          //       // start_date: Joi.date().iso().required(),
          //       // end_date : Joi.date().iso().greater(Joi.ref('start_date')).required()
          //   })
        }).allow({}),
      };
    },

    history() {
      return {
        query: Joi.object().keys({
          sudo: Joi.string().optional(),
          fake: Joi.string().optional(),
          limit: Joi
            .number()
            .integer()
            .optional(),
          offset: Joi
            .number()
            .integer()
            .optional(),
          // where: Joi
          //   .object()
          //   .keys({
          //     // user_id: this._common().user_id?.error(boom.badData),
          //     user_id: Joi.any()?.error(boom.badData),
          //     crypto: Joi
          //       .string()
          //       .valid(...Object.keys(SUPPORTED_TOKENS))
          //       .error(boom.badData),
          //       // start_date: Joi.date().iso().required(),
          //       // end_date : Joi.date().iso().greater(Joi.ref('start_date')).required()
          //   })
        }).allow({}),
      };
    },

    findByID() {
      return {
        params: Joi.object({ id: this?._common()?.id.required() }),
      };
    },

    // UPDATE ------------------------------------------------

    updateByID() {
      const { id, iso_code, name, type } = this._common();
      return {
        params: Joi.object({
          id: this._common()?.id.required(),
        }),
        payload: Joi.object({
          amount: this._common()?.amount.required(),
          crypto: this._common()?.crypto.required(),
          reason: this._common()?.reason.optional(),
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
    

    
  };
};
