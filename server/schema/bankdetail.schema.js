const Joi = require("joi");
// CREATE ------------------------------------------------
module.exports = (server) => {
  const {
    consts: { FIAT_CURRENCIES },
    boom,
  } = server.app;

  return {
    create() {
      return {
        payload: Joi.object({
          /* 
            SWIFT CODE FORMAT: AAAABBCCDDD

            AAAA: 4 character bank code
            BB: 2 character country code
            CC: 2 character location code 
            */
          swift_code: Joi.string()
            .alphanum()
            .min(8)
            .max(11)
            .required()
            .error(boom.badRequest("Invalid swift code")),

          bank_name: Joi.string()
            .optional()
            .error(boom.badRequest("Bank name is invalid")),
        }),
      };
    },

    // UPDATE ------------------------------------------------

    update() {
      return {
        params: Joi.object({
          id: Joi.string()
            .uuid()
            .required()
            .error(boom.badRequest(`Optional input <id::uuid> is invalid`)),
        }),
        payload: Joi.object({
          swift_code: Joi.string()
            .alphanum()
            .min(8)
            .max(11)
            .optional()
            .error(
              boom.badRequest(`Optional input <swift_code::string> is invalid`)
            ),

          bank_name: Joi.string()
            .optional()
            .error(
              boom.badRequest(`Optional input <bank_name::string> is invalid`)
            ),
        }),
      };
    },

    // REMOVE ------------------------------------------------

    remove() {
      return {
        payload: Joi.object({
          force: Joi.boolean()
            .default(false)
            .optional()
            .error(new Error("Optional input <force::boolean> is invalid")),
        }).optional(),

        params: this.update()?.params,
      };
    },

    // RESTORE ------------------------------------------------
    restore(server) {
      return {
        params: this.update()?.params,
      };
    },
  };
};
