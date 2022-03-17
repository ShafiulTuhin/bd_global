const Joi = require("joi");
const { SECESSION_STATUSES } = require("../constants");

module.exports = (server) => {
  const {
    consts,
    boom,
  } = server.app;
  const types = Object.values(SECESSION_STATUSES);

  return {
    _common() {
      return {
        include: Joi.any()
          .allow(Joi.array().items(Joi.string()), Joi.string())
          ?.error(boom.badRequest),
        description: Joi.string()?.error(boom.badRequest),
        access_level: Joi.number()
          .integer()
          .min(1)
          .max(3)
          .error(boom.badRequest),
        id: Joi.string()
          .uuid()
          .error(boom.badRequest),
        status: Joi.any().custom((value) => {
          if (!types.includes(String(value)?.toUpperCase()))
            throw new Error(`Expected: [ ${types?.join(", ")} ]`);
          return value;
        }),
        sudo: Joi.bool()
          ?.default(false)
          .error(boom.badRequest),
        fake: Joi.bool()
          ?.default(false)
          .error(boom.badRequest),
        paranoid: Joi.bool()
          ?.default(false)
          ?.error(boom.badRequest),
        createdAt: Joi.any()
          .allow(Joi.string(), Joi.date())
          ?.error(boom.badRequest),
        updatedAt: Joi.any()
          .allow(Joi.string(), Joi.date())
          ?.error(boom.badRequest),
        order: Joi.any()
          .allow(Joi.array(), Joi.string())
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
     * @function create - Schema validator for creating a single record
     * @param {Object} server - Hapi server instance
     * @returns {Object} validator
     */
    create() {
      return {
        payload: Joi.object()
          .keys({
            description: this._common()?.description,
            access_level: this._common()?.access_level,
          })
          .optional()
          .allow(null),
      };
    },

    find() {
      return {
        query: Joi.object()
          .keys({
            order: this._common()?.order,
            include: this._common().include,
            sudo: this._common()?.sudo,
            paranoid: this._common()?.paranoid,
            fake: this._common()?.fake,
            limit: this._common()?.limit,
            offset: this._common()?.offset,
            where: Joi.object()?.keys({
              user_id: Joi.string().uuid(),
              status: this._common()?.status,
              createdAt: this._common()?.createdAt,
              updatedAt: this._common()?.updatedAt,
            }),
          })
          .allow({})
          .error(boom.badRequest),
        /* .or("order", "include", "sudo", "where"), */
      };
    },

    updateByID() {
      return {
        params: Joi.object({
          id: this._common()?.id.error(
            boom.badRequest(`Required input <id::uuid> is invalid`)
          ),
        }),
        payload: Joi.object({
          status: this._common()
            ?.status.optional()
            ,
        }),
      };
    },

    /**
     * @function update
     * @param {Object} server - Hapi server instance
     * @returns
     */
    update() {
      return {
        payload: Joi.object({
          ids: Joi.array().items(
            this._common()?.id.error(
              boom.badRequest(`Required input <ids::uuid> is invalid`)
            )
          ),
        }),
      };
    },
  };
};
