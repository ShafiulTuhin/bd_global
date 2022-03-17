const Joi = require("joi");
const { CURRENCY_TYPES } = require("../constants");

module.exports = (server) => {
  const {
    boom,
    consts: { FIAT_CURRENCIES, CRYPTO_CURRENCIES },
  } = server.app;

  return {
    // CREATE ------------------------------------------------
    /**
     * @ create - Schema validator for creating a single currency entity
     * @returns {Object} validator
     */
    create() {
      const { iso_code, name, type } = this._common();

      return {
        payload: Joi.object({
          iso_code: iso_code.required(),
          name: name.required(),
          type: type.required(),
        }),
      };
    },

    // UPDATE ------------------------------------------------

    updateByID() {
      const { id, iso_code, name, type } = this._common();
      return {
        params: Joi.object().keys({ id }),
        payload: Joi.object().keys({
          iso_code,
          name,
          type,
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
        id: Joi.string().uuid(),
        force: Joi.boolean()
          .default(false)
          .error(boom.badRequest("<force::boolean> is invalid")),
        iso_code: Joi.string().error(
          boom.badRequest("<iso_code::string> is invalid")
        ),
        name: Joi.string().error(boom.badRequest("<name::string> is invalid")),
        type: Joi.string()
          .valid(...Object.keys(CURRENCY_TYPES))
          .insensitive()
          .error(
            boom.badRequest(
              `input <type::ENUM(${Object.keys(CURRENCY_TYPES).join(
                ","
              )})> is invalid`
            )
          ),
      };
    },
  };
};
