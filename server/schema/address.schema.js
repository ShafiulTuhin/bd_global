"use strict"
const Joi = require('joi');
const { COUNTRIES } = require('../constants');
mmodule.exports = (server) => {
  return {
    _common() {
      return {
        id: Joi.string().uuid(),
        address_line: Joi.string(),
        country: Joi.string().valid(...Object.keys(COUNTRIES)),
        zipcode: Joi.string().length(5)
      }
    },
    create() {
      return {
        payload: Joi.object().keys({
          address_line: this._common()?.address_line?.required(),
          country: this._common().country?.required(),
          zipcode: this._common()?.zipcode
        })
      }
    },
    updateByID() {
      return {
        params: this._common().id?.required(),
        payload: Joi.object().keys()
      }
    }
  }
}