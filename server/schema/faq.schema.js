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
       * @type {Joi}
       */
      return {
        payload: Joi.object().keys({
          answer: this._common()?.answer?.required(),
          question: this._common()?.question?.required(),
          category: this._common()?.category?.required(),
          subcategory: this._common()?.category?.required(),
          link: this._common()?.link?.optional(),
        }),
        query: Joi.object()
          .keys({
            sudo:Joi.bool().default(false).optional(),
          }).optional(),
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
            question:this._common().question?.optional(),
            answer:this._common().answer.optional(),
            category:this._common().category.optional(),
            subcategory:this._common().category.optional(),
            active:Joi.bool().optional(),
            link:this._common().link.optional()
          }),
        query: Joi.object()
          .keys({
            fake:Joi.bool().default(false).optional(),
            sudo:Joi.bool().default(false).optional(),
          }),
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
          // .error(boom.badRequest(`<id::uuid> is invalid`))
          ,
        question: Joi.string()
          // .error(
          //   boom.badRequest(
          //     "question: must be a string"
          //   )
          // )
          ,
        answer: Joi.string()
          // .error(
          //   boom.badRequest(
          //     "answer: must be a string"
          //   )
          // )
          ,
        category: Joi.string()
          // .error(
          //   boom.badRequest(
          //     "link: must be a string"
          //   )
          // )
          ,
        link: Joi.string()
          // .error(
          //   boom.badRequest(
          //     "link: must be a string"
          //   )
          // )
          ,
        force: Joi.boolean()
          .default(false)
          .error(new Error("<force::boolean> is invalid")),
      };
    },
  };
};
