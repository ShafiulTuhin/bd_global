const Joi = require("joi");
const { ORDER_STATUSES } = require("../constants");

module.exports = function(server) {
  const {
    boom,
    consts: { PATTERNS },
  } = server.app;

  return {
    _common() {
      return {
        id: Joi.string()
          .pattern(PATTERNS?.ORDER_ID)
          .error(boom.badData),
        advert_id: Joi.string()
          .uuid()
          .error(boom.badData),
        order: Joi.string().error(boom.badData),
        total_amount: Joi.number().error(boom.badData),
        total_quantity: Joi.number().error(boom.badData),
        appeal: Joi.string()
          .label("Order Appeal")
          .max(100)
          .error(boom.badData),
        remark: Joi.string()
          .max(100)
          .label("Order remark")
          .error(boom.badData),
        status: Joi.string()
          .valid(...Object.keys(ORDER_STATUSES))
          .uppercase()
          .error(boom.badData),
        rating: Joi.number()
          .integer()
          .min(0)
          .max(5)
          .error(boom.badData),
        trx_id: Joi.string()
          .label("Transaction ID")
          .error(boom.badData),
        force: Joi.boolean()
          .default(false)
          .error(boom.badData),
        sudo: Joi.string().error(boom.badData),
        fake: Joi.string().error(boom.badData),
        limit: Joi.number()
          .integer()
          .error(boom.badData),
        offset: Joi.number()
          .integer()
          .error(boom.badData),
      };
    },
    /**
     * @function create - Schema validator for creating a single currency entity
     * @param {Object} server - Hapi server instance
     * @returns {Object} validator
     */
    confirm() {
      return {
        params: Joi.object({
          id: this._common()?.id.required(),
        }),
      };
    },
    // CREATE ------------------------------------------------

    /**
     * @function create - Schema validator for creating a single currency entity
     * @param {Object} server - Hapi server instance
     * @returns {Object} validator
     */
    create() {
      return {
        payload: Joi.object({
          advert_id: this._common().advert_id.required(),
          total_amount: this._common().total_amount.required(),
          total_quantity: this._common().total_quantity.required(),
        }),
      };
    },

    // UPDATE ------------------------------------------------

    /**
     * @function update - Schema validator for updating a single currency entity
     * @param {Object} server - Hapi server instance
     * @returns
     */
    update() {
      return {
        params: Joi.object({
          id: this._common().id.required(),
        }),
        payload: Joi.object({
          total_quantity: this._common().total_quantity.optional(),
          appeal: this._common().appeal,
          remark: this._common().remark,
          status: this._common().status,
          rating: this._common().rating,
          trx_id: this._common().trx_id,
        }),
      };
    },

    // REMOVE ------------------------------------------------

    remove() {
      return {
        params: Joi.object({
          id: this._common().id.required(),
        }),
        payload: Joi.object({
          ids: Joi.array()
            .items(this._common().id)
            .error(boom.badRequest),
          force: this._common().force.optional(),
        })
          .error(boom.badRequest)
          .allow({}),
      };
    },

    // RESTORE ------------------------------------------------

    restore() {
      return {
        params: Joi.object({
          id: this._common().id.required(),
        }),
        payload: Joi.object({
          data: Joi.array()
            .items(this._common().id.required())
            .error(boom.badRequest),
        }),
      };
    },

    // FIND ------------------------------------------------

    find() {
      return {
        params: Joi.object().keys({
          id: this._common().id.required(),
        }),
        query: Joi.object()
          .keys({
            where: Joi.object().keys({
              created_at: Joi.any()?.error(boom.badData),
              updated_at: Joi.any()?.error(boom.badData),
              status: Joi.any()?.error(boom.badData),
              [`$"advert"."crypto"$`]: Joi.any()?.error(boom.badData),
              [`$"advert"."type"$`]: Joi.any()?.error(boom.badData),
              advert_id: Joi.any()?.error(boom.badData),
              "$advert.user_id$": Joi.any()?.error(boom.badData),
              user_id: Joi.any()?.error(boom.badData),
            }),
            order: Joi.string()?.error(boom.badData),
            sudo: this._common()?.sudo,
            fake: this._common()?.fake,
            limit: this._common()?.limit,
            offset: this._common()?.offset,
          })
          .allow({}),
      };
    },
  };
};
