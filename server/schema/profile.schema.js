const Joi = require("joi");

module.exports = function(server) {
  const { boom } = server.app;
  return {
    _common() {
      return {
        profile_id: Joi.string().uuid(),
        lname: Joi.string().min(2),
        oname: Joi.string().min(2),
        date_of_birth: Joi.date().iso(),
        gender: Joi.string(),
        force: Joi.boolean().default(false),
      };
    },
  
    // UPDATE ------------------------------------------------

    /**
     * @function create - Schema validator for creating a single record
     * @returns {Object} validator
     */
    update() {
      return {
        payload: Joi.object({
          lname: this._common()?.lname,
          oname: this._common()?.oname,
          date_of_birth: this._common()?.date_of_birth,
          gender: this._common()?.gender,
        }),
      };
    },
    // UPDATE ------------------------------------------------

    /**
     * @function updateByID - Schema validator for updating a single currency entity
     * @returns
     */
    updateByID() {
      return {
        params: this._common()?.profile_id,
        payload: this.update()?.payload,
      };
    },

    // REMOVE ------------------------------------------------
    /**
     * @function removeByID
     * @returns
     */
    removeByID() {
      return {
        payload: Joi.object({
          force: this._common()?.force,
        }).optional(),
        params: Joi.object({ id: this._common()?.profile_id?.required() }),
      };
    },
    /**
     * @function remove
     * @returns
     */
    remove() {
      return {
        payload: Joi.object({
          data: Joi.array()
            .items(this._common()?.profile_id)
            .optional()
            .error(boom.badRequest(`Required input <data::Array> is invalid`)),
          force: this._common()?.force,
        }).error(
          boom.badRequest(`Required input <payload::Object> is invalid`)
        ),
      };
    },

    // FIND ------------------------------------------------
    /**
     * @function find
     * @returns
     */
    find() {
      return {};
    },

    /**
     * @function findByID
     * @returns
     */
    findByID() {
      return {
        params: Joi.object({
          profile_id: this._common()?.profile_id?.required(),
        }),
      };
    },
  };
};
