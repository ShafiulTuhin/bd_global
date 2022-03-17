const Joi = require("joi");

module.exports = (server) => {
  const {
    consts: { KYC_STATUSES, KYC_TYPES },
    boom,
  } = server.app;

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
          type: this._common()?.type.required(),
          uploads: this._common()?.uploads.optional(),
        }),
      };
    },

    // UPDATE ------------------------------------------------
    /**
     * @description update multiple records
     * @returns
     */
    update() {
      return {
        payload: Joi.object()
          .keys({
            ids: Joi.array()
              .items(this._common().id)
              .required(),
            status: this._common()?.status,
            uploads: this._common()?.uploads,
          })
          .or("status", "uploads"),
      };
    },
    /**
     * @description update using id
     * @returns
     */
    updateByID() {
      return {
        params: Joi.object({
          id: this._common().id.required(),
        }),
        payload: Joi.object()
          .keys({
            status: this._common()?.status,
            uploads: this._common()?.uploads,
          })
          .or("status", "uploads"),
      };
    },
    /**
     * @description update using user_id and type
     * @returns
     */
    updateByUserAndType() {
      return {
        params: Joi.object({
          user_id: this._common().user_id.required(),
          type: this._common().type.required(),
        }),
        payload: Joi.object()
          .keys({
            status: this._common()?.status,
            uploads: this._common()?.uploads,
          })
          .or("status", "uploads"),
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
          force: _common()?.force?.optional(),
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
        id: Joi.string()
          .uuid()
          .error(boom.badRequest(`<id::uuid> is invalid`)),
        user_id: Joi.string()
          .uuid()
          .error(boom.badRequest(`< user_id > is invalid or missing`)),
        uploads: Joi.any()
          .allow({})
          .error(boom.badRequest(`< uploads > is invalid or missing`)),
       
        type: Joi.string()
          .valid(...Object.keys(KYC_TYPES))
          .error(
            boom.badRequest(
              `< type::String(${Object.keys(KYC_TYPES)?.join(
                ", "
              )}) > is invalid or missing`
            )
          ),
        status: Joi.string()
          .uppercase()
          .valid(...Object.keys(KYC_STATUSES))
          .error(
            boom.badRequest(
              `< status::String(${Object.keys(KYC_STATUSES)?.join(
                ", "
              )}) > is invalid or missing`
            )
          ),
        force: Joi.boolean()
          .default(false)
          .error(new Error("<force::boolean> is invalid")),
      };
    },
  };
};