const Joi = require("joi");

module.exports = (server) => {
  const {
    consts: { PATTERNS , TRADE_TYPES, SUPPORTED_FIAT, SUPPORTED_TOKENS},
    boom,
  } = server.app;
  return {
    _common() {
      return {
        id: Joi.string()
          .uuid()
          .error(boom.badRequest(`<id::uuid> is invalid or missing`)),
        force: Joi.boolean()
          .default(false)
          .error(new Error("Optional input <force::boolean> is invalid")),
        min_order_qty: Joi.number().error(
          boom.badRequest(`<min_order_qty::number> is invalid`)
        ),
        max_order_qty: Joi.number().error(
          boom.badRequest(`<max_order_qty::number> is invalid`)
        ),
        payment_methods: Joi.any()
          .allow(
            Joi.object().allow({}),
            Joi.array().items(Joi.object()),
            Joi.string()
          )
          .error(boom.badRequest(`<payment_method::array[string]> is invalid`)),
        type: Joi.string()
          .pattern(PATTERNS.ADVERT_TYPE)
          .error(boom.badRequest(`<type::string> is invalid`)),
        price: Joi.number().error(
          boom.badRequest(`<price::number> is invalid`)
        ),
        total_qty: Joi.number().error(
          boom.badRequest(`<qty::number> is invalid`)
        ),
        crypto: Joi.string()
          .valid(...Object.keys(SUPPORTED_TOKENS))
          .error(boom.badRequest(`<crypto::string> is invalid`)),
        fiat: Joi.string()
          .valid(...Object.keys(SUPPORTED_FIAT))
          .label("Fiat currency")
          .error(boom.badRequest(`<fiat::string> is invalid`)),
        payment_ttl_mins: Joi.number()
          .integer()
          .default(90)
          .label("Payment time to live")
          .error(
            boom.badRequest(
              `Optional input <payment_time_limit::number> is invalid`
            )
          ),
        floating_price_margin: Joi.number().error(
          boom.badRequest(`Optional input <floating_price::number> is invalid`)
        ),
        remarks: Joi.string()
          .allow("")
          .error(
            boom.badRequest(`Optional input <remarks::string> is invalid`)
          ),
        auto_reply_message: Joi.string()
          .allow("")
          .error(
            boom.badRequest(
              `Optional input <auto_reply_message::string> is invalid`
            )
          ),
        counter_party_conditions: Joi.any().error(
          boom.badRequest(
            `Optional input <counter_party_conditions::string> is invalid`
          )
        ),
        published: Joi.boolean().error(
          boom.badRequest(`Optional input <published::string> is invalid`)
        ),
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
          auto_reply_message: this._common()?.auto_reply_message.optional(),
          counter_party_conditions: this._common()?.counter_party_conditions.optional(),
          crypto: this._common()?.crypto.required(),
          fiat: this._common()?.fiat.required(),
          floating_price_margin: this._common()?.floating_price_margin.optional(),
          market_price: this._common()?.price.required(),
          max_order_qty: this._common()?.max_order_qty.required(),
          min_order_qty: this._common()?.min_order_qty.required(),
          payment_methods: this._common()?.payment_methods.required(),
          payment_ttl_mins: this._common()?.payment_ttl_mins.optional(),
          price: this._common()?.price.required(),
          published: this._common()?.published.optional(),
          remarks: this._common()?.remarks.optional(),
          total_qty: this._common()?.total_qty.required(),
          type: this._common()?.type.required(),
          available_qty: this._common()?.total_qty.optional(),
        }),
      };
    },

    // UPDATE ------------------------------------------------

    /**
     * @function updateByID - Schema validator for updating a single currency entity
     * @param {Object} server - Hapi server instance
     * @returns
     */
    updateByID() {
      return {
        params: Joi.object({
          id: this._common()?.id.required(),
        }),
        payload: Joi.object({
          published: this._common()?.published.optional(),
          min_order_qty: this._common()?.min_order_qty.optional(),
          max_order_qty: this._common()?.max_order_qty.optional(),
          payment_methods: this._common()?.payment_methods.optional(),
          price: this._common()?.price.optional(),
          total_qty: this._common()?.total_qty.optional(),
          available_qty: this._common()?.total_qty.optional(),
          crypto: this._common()?.crypto.optional(),
          fiat: this._common()?.fiat.optional(),
          payment_ttl_mins: this._common()?.payment_ttl_mins.optional(),
          floating_price_margin: this._common()?.floating_price_margin.optional(),
          remarks: this._common()?.remarks.optional(),
          auto_reply_message: this._common()?.auto_reply_message.optional(),
          counter_party_conditions: this._common()?.counter_party_conditions.optional(),
        }),
      };
    },

    /**
     * @function update - Schema validator for creating bulk currency entities
     * @param {Object} server - Hapi server instance
     * @returns
     */
    update() {
      return {
        payload: Joi.object({
          ids: Joi.array().items(this._common()?.id),
          published: this._common()?.published.optional(),
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
          order: Joi.string(),
          where: Joi
            .object()
            .keys({
              published: Joi.boolean().optional(),
              user_id: Joi.string().optional(),
              min_order_qty: Joi.number().optional(),
              max_order_qty: Joi.number().optional(),
              available_qty: Joi.number().optional(),
              market_price: Joi.number().optional(),
              floating_price_margin: Joi.number().optional(),
              payment_methods: Joi.any().optional(),
              total_qty: Joi.number().optional(),
              price: Joi.number().optional(),
              crypto: Joi.string().optional(),
              fiat: Joi.string().optional(),
              type: Joi
                .string()
                .valid(...Object.values(TRADE_TYPES))
                .optional(),
              created_at: Joi.object().optional(),
              updated_at: Joi.object().optional(),
            })
            .optional(),
        }).allow({}),
      };
    },
    findByID() {
      return {
        params: Joi.object({ id: this?._common()?.id.required() }),
      };
    },
    // REMOVE ------------------------------------------------

    remove() {
      return {
        payload: Joi.object({
          ids: Joi.array()
            .items(this._common()?.id)
            .optional(),
          force: this._common()?.force.optional(),
        }),
      };
    },
    removeByID() {
      return {
        params: Joi.object({
          id: this._common()?.id,
        }),
        payload: Joi.object({
          force: this._common()?.force.optional(),
        }),
      };
    },

    // RESTORE ------------------------------------------------

    restoreByID() {
      return {
        params: Joi.object().keys({
          id: this._common().id.required(),
        }),
      };
    },

    restore() {
      return {
        payload: Joi.object({
          data: Joi.array().items(this._common()?.id),
        }),
      };
    },
  };
};
