const Joi = require("joi");

module.exports = (server) => {
  const { boom } = server.app;

  return {
    // CREATE ------------------------------------------------
    /**
     * @description create kyc schema
     * @returns
     */
    create() {
      /**
       * @type Joi
       */
      return {
        payload: Joi.object().keys({
          file: this._common()?.file.optional(),
        }),
      };
    },
    // FIND --------------------------------------------------
    find() {
      return {
        query: {
          download: this._common()?.download,
        },
      };
    },
    // REMOVE ------------------------------------------------
    /**
     * @description Removes multiple
     * @returns
     */
    remove() {
      return {
        payload: Joi.object({
          ids: Joi.array()
            .items(this._common().id)
            .required()
            .error(boom.badRequest(`Required input <ids::Array> is invalid`)),
          force: this._common()?.force?.optional(),
        }).error(
          boom.badRequest(`Required input <payload::Object> is invalid`)
        ),
      };
    },
    removeByID() {
      return {
        params: Joi.object().keys({
          id: this._common()?.id.required(),
        }),
        payload: Joi.object()
          .keys({
            force: this._common()?.force?.optional(),
          })
          ?.optional()
          ?.allow(null),
      };
    },

    /**
     * @function _common - Schema validator for updating a single currency entity
     * @returns
     */
    _common() {
      return {
        download: Joi.boolean().default(false),
        id: Joi.string()
          .uuid()
          .error(boom.badRequest(`<id::uuid> is invalid`)),

        file: Joi.any()
          .optional()
          .allow("")
          .description("image file")
          .error(boom.badRequest(`< file > is invalid or missing`)),

        force: Joi.boolean()
          .default(false)
          .error(new Error("<force::boolean> is invalid")),
      };
    },
  };
};
