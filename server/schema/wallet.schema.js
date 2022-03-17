const Joi = require("joi");

module.exports = (server) => {
  const { boom } = server.app;
  return {
    _common() {
      return {
        asset: Joi.string().error(boom.badRequest),
        iso_code: Joi.string().error(boom.badRequest),
        id: Joi.string()
          .uuid()
          .error(boom.badRequest),
        name: Joi.string().error(boom.badRequest),
        type: Joi.string().error(boom.badRequest),
        network: Joi.string().error(boom.badRequest),
        amount: Joi.string().error(boom.badRequest),
        address: Joi.string().error(boom.badRequest),
        destinationTag: Joi.number().allow("").error(
          boom.badRequest(`<destinationTag::number> is invalid`)
        ),
        createdAt: Joi.any()
          .allow(Joi.string(), Joi.date())
          ?.error(boom.badRequest),
        updatedAt: Joi.any()
          .allow(Joi.string(), Joi.date())
          ?.error(boom.badRequest),
        order: Joi.any()
          .allow(Joi.array(), Joi.string())
          ?.error(boom.badRequest),
        is_company_wallet: Joi.bool()
          .default(false)
          .error(boom.badRequest),
        sudo: Joi.bool()
          ?.default(false)
          .error(boom.badRequest),
        fake: Joi.bool()
          ?.default(false)
          .error(boom.badRequest),
        paranoid: Joi.bool()
          ?.default(false)
          ?.error(boom.badRequest),
        limit: Joi.any()
          .allow(Joi.string(), Joi.number())
          .error(boom.badRequest),
        offset: Joi.any()
          .allow(Joi.string(), Joi.number())
          .error(boom.badRequest),
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
        params: Joi.object({
          asset: this._common()?.asset.required(),
        }).error(boom.badRequest),
      };
    },

    // RETRIEVE ------------------------------------------------

    findByAddress() {
      return {
        params: Joi.object({
          address: this._common().address.required(),
        }).error(boom.badRequest),
      };
    },

    find() {
      return {
        query: Joi.object()
          .keys({
            where: Joi.object().keys({
              is_company_wallet: this._common()?.is_company_wallet,
              user_id: this._common().id,
              address: this?._common()?.address,
              createdAt: this._common()?.createdAt,
              updatedAt: this._common()?.updatedAt,
            }),
            limit: this._common()?.limit,
            offset: this._common()?.offset,
            paranoid: this._common()?.paranoid,
            sudo: this._common()?.sudo,
            fake: this._common()?.fake,
            order: this._common()?.order,
          })
          .error(boom.badRequest),
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
          id: this._common()
            ?.id.required()
            .error(boom.badRequest(`Required input <id::uuid> is invalid`)),
        }),
        payload: Joi.object({
          iso_code: this._common()?.iso_code.error(
            boom.badRequest("<iso_code::string> is invalid")
          ),
          name: this._common()?.name.error(
            boom.badRequest("<name::string> is invalid or missing")
          ),
          type: this._common()?.type.error(
            boom.badRequest("Required input <type::string> is invalid")
          ),
        }),
      };
    },

    /**
     * @function bulkUpdate - Schema validator for creating bulk currency entities
     * @param {Object} server - Hapi server instance
     * @returns
     */
    withdraw() {
      return {
        payload: Joi.object().keys({
          amount: this._common()?.amount.required(new Error("amount is required")),
          from: this._common()?.address.required(new Error("from (address of the sender) is required")),
          to: this._common()?.address.required(new Error("from (address of the sender) is required")),
          destinationTag: this._common()?.destinationTag.optional(),
        }),
      };
    },
  };
};
