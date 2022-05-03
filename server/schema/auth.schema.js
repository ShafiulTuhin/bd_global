"use strict";
const Joi = require("joi");

module.exports = (server) => {
  const {
    boom,
    consts: { PATTERNS },
  } = server.app;

  return {
    _common() {
      return {
        email: Joi.string()
          .email({ minDomainSegments: 2 })
          .label("Email address")
          .error(boom.badData("<email::string> is invalid")),
        password: Joi.string()
          .pattern(PATTERNS.PASSWORD)
          .error(boom.badData("<password::string> is invalid")),
        repeat_password: Joi.ref("password"),
        access_level: Joi.number()
          .max(3)
          .default(1)
          .label("Access Level"),
        token: Joi.string()?.allow(""),
        id: Joi.string().uuid(),
        invite_code: Joi.string()
          .label("Invitation code")
          .allow("", null)
          .error(boom.badRequest("<invite_code::string> is invalid")),
      };
    },
    googleOAuth() {
      return {
        payload: Joi.object()
          .keys({
            profileObj: Joi.object()
              .keys({
                googleId: Joi.string()?.required(),
                imageUrl: Joi.string().uri(),
                email: this._common()?.email?.required(),
                name: Joi.string().optional(),
                givenName: Joi.string().optional(),
                familyName: Joi.string().optional(),
              })
              ?.required(),
            tokenId: Joi.string().required(),
          })
          .unknown(),
      };
    },
    authenticate() {
      return {
        payload: Joi.object({
          email: this._common()?.email?.required(),
          password: this._common()?.password?.required(),
          access_level: this._common()?.access_level?.required(),
        }).with("email", "password"),
      };
    },
    registerGoogleAuthenticator() {
      return {
        payload: Joi.object({
          secret:Joi.string().required().error(boom.badData("<secret::string> was not provided")),
          encoding:Joi.string().required().error(boom.badData("<encoding:string> was not provided"))
        }),
      };
    },
    verifyGoogleAuthenticator() {
      return {
        payload: Joi.object({
          token:Joi.string().required().error(boom.badData("<token::string> was not provided")),
          user_id:Joi.string().uuid().required(),
          
        }),
      };
    },
    verifyGoogleAuthenticatorSecret() {
      return {
        payload: Joi.object({
          secret:Joi.string().required().error(boom.badData("<secret::string> was not provided")),
          user_id:Joi.string().uuid().required(),
          
        }),
      };
    },
    /**
     * @function requestPasswordChange
     * @returns
     */
    requestPasswordChange() {
      return {
        payload: Joi.object({
          email: this._common()?.email?.required(),
        }).with("token", "password"),
      };
    },
    /**
     * @function reset
     * @returns
     */
    changePassword() {
      return {
        payload: Joi.object({
          new_password: this._common()?.password?.required(),
          old_password: this._common()?.password?.optional(),
          token: this._common()?.token.required(),
          id: this._common()?.id.optional(),
        }).with("token", "new_password"),
      };
    },

    /**
     * @function register - Schema validator for creating a single record
     * @returns {Object} validator
     */
    register() {
      return {
        payload: Joi.object({
          email: this._common()?.email?.required(),
          password: this._common()?.password?.required(),
          invite_code: this._common()?.invite_code.optional(),
          repeat_password: this._common()?.repeat_password,
        })
          .with("password", "repeat_password")
          .error(boom.badRequest("Payload error")),
      };
    },
  };
};
