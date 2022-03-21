"use strict";
const { OAuth2Client } = require("google-auth-library");
const dfn = require("date-fns");
const faker = require("faker");
const URL = require("url");
const {
  CLIENT_ROUTES,
  KYC_STATUSES,
  KYC_TYPES,
  JWT_SCOPES,
} = require("../constants");
const { Op } = require("sequelize")

module.exports = (server) => {
  const {
    db: {
      User,
      Profile,
      Kyc,
      sequelize,
      // Sequelize: { Op },
    },
    config: { googleOAuth },
    config: { base_url },
    helpers: { jwt, decrypt, encrypt },
    mailer,
    boom,
  } = server.app;
  const googleClient = new OAuth2Client(googleOAuth?.clientId);

  return {
    async loginWithGoogle(req) {
      const {
        payload: { tokenId, profileObj },
        info: { remoteAddress },
      } = req;
      try {
        if (!tokenId) return boom.unacceptable(`tokenId is missing`);
        if (!profileObj) return boom.unacceptable(`profileObj is missing`);

        const ticket = await googleClient
          .verifyIdToken({
            idToken: tokenId,
            audience: googleOAuth?.clientId, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
          })
          .catch((err) => {
            throw boom.expectationFailed(
              `Cannot verify Google User.  Try again!`,
              err
            );
          });

        const payload = ticket.getPayload();

        // Find user via email
        let user = await User.findOne({
          where: { email: payload?.email },
        });

        // If user is found
        if (user) {
          // get user's IP address
          const xFF = req?.headers["x-forwarded-for"];
          const ip_address = xFF ? xFF.split(",")[0] : remoteAddress;

          // Attempt authenticating user
          let authResponse = await user.authenticate({
            ip_address,
          });

          let { status, two_factor_enabled, security, ...rest } = authResponse;

          if (!status) return authResponse;

          // If user has enabled 2FA
          if (two_factor_enabled)
            return {
              ...rest,
              reason: "2fa-enabled",
              message:
                "2FA enabled. Send OTP using the user ID to complete the authentication ",
            };
          // Login user in
          return user.login(user, {
            security,
          });
        }
        // No user with email was found in the DB
        return boom.notFound(
          "Account not found! Google account user not found! Register and try again!"
        );
      } catch (err) {
        console.log(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    /**
     * @function - Authenticates user
     * @param {Object} req - Request object
     * @param {Object} req.payload
     * @param {String} req.payload.email
     * @param {String | "basic"} req.payload.role
     * @param {String} req.payload.password
     * @returns
     */
    async authenticate(req) {
      try {
        const {
          payload: { email, access_level = 1, password },
          info: { remoteAddress },
        } = req;
        const xFF = req?.headers["x-forwarded-for"];
        const ip_address = xFF ? xFF.split(",")[0] : remoteAddress;

        const level = access_level == 1 ? access_level : { [Op.gt]: 1 };
        let where = { email, access_level: level };

        // fetch user record from DB that matches the email
        let user = await User.findOne({
          where,
          // logger: console.log,
          trim: false,
        });

        if (user) {
          let authResponse = await user.authenticate({
            ip_address,
          });

          let { status, two_factor_enabled, security, ...rest } = authResponse;

          if (!status) return authResponse;

          return two_factor_enabled
            ? {
              ...rest,
              reason: "2fa-enabled",
              message:
                "2FA enabled. Send OTP using the user ID to complete the authentication ",
            }
            : (await decrypt(password, user?.password))
              ? user.login(user, {
                security,
              })
              : boom.notFound("Incorrect password!");
        }

        return boom.notFound(
          "Account not found! May be due to incorrect email or password. Try again!"
        );
      } catch (error) {
        console.debug(error);
        return boom.boomify(error);
      }
    },

    /**
     *@description
     * @param {Object} req
     * @returns
     */
    async register(req) {
      let { payload } = req;

      try {
        return User.register(payload);
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     *@description
     * @param {Object} req
     * @returns {Promise<{status:"success"}>}
     */
    async registerGoogleAuthenticator(req) {
      let {
        payload,
        pre: {
          permission: { user },
        },
      } = req;

      try {
        return await user.registerGoogleAuthenticator(payload);
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },
    /**
     *@description
     * @param {Object} req
     * @returns {Promise<{status:"success"}>}
     */
    async verifyGoogleAuthenticator(req) {
      let { payload } = req;

      try {
        let user = await User.findByPk(payload.user_id);
        if (!user) return boom.notFound("user does not exist");

        return await user.verifyGoogleAuthenticator(payload);
      } catch (error) {
        // console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     *@description
     * @param {Object} req
     * @returns {Promise<{status:"success"}>}
     */
    async verifyGoogleAuthenticatorSecret(req) {
      let { payload } = req;

      try {
        let user = await User.findByPk(payload.user_id);
        if (!user) return boom.notFound("user does not exist");

        return await user.verifyGoogleAuthenticatorSecret(payload);
      } catch (error) {
        // console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     * @function registerWithGoogle
     * @param {Object} req
     * @returns
     */
    async registerWithGoogle(req) {
      const {
        payload: { tokenId, profileObj },
      } = req;
      /* const xFF = req?.headers["x-forwarded-for"];
      const ip_address = xFF ? xFF.split(",")[0] : remoteAddress; */

      try {
        if (!tokenId) return boom.unacceptable(`tokenId is missing`);
        if (!profileObj) return boom.unacceptable(`profileObj is missing`);

        const ticket = await googleClient
          .verifyIdToken({
            idToken: tokenId,
            audience: googleOAuth?.clientId, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
          })
          .catch((err) => {
            throw boom.expectationFailed(
              `Cannot verify Google User.  Try again!`,
              data
            );
          });

        const { email, name, family_name } = ticket.getPayload();

        /**
         * type User
         */
        let foundUser = await User.findOne({
          where: {
            email,
          },
        });

        /**
         * @function setEmailKyc
         * @description Sets the email kyc of a user
         * @param {User} user
         * @param {Object} options - Query options
         */
        const setEmailKyc = async (user, options = {}) => {
          let [foundKyc, isNew] = await Kyc.findOrCreate({
            defaults: {
              type: KYC_TYPES.EMAIL,
              status: KYC_STATUSES?.ACCEPTED,
              user_id: user?.id,
            },
            where: { user_id: user?.id, type: KYC_TYPES?.EMAIL },
            ...options,
          }).catch(console.error);

          if (!isNew) {
            foundKyc.status = KYC_STATUSES?.ACCEPTED;
            foundKyc.save(options);
          }
        };
        // Create user if not found
        if (!foundUser) {
          let profile = {};
          let user = await sequelize
            .transaction(async (t) =>
              User.create(
                {
                  email,
                  password: faker.internet.password(),
                  password_is_unknown: true,
                  access_level: 1,
                },
                {
                  transaction: t,
                }
              ).then(async (user) => {
                // Create user's profile
                profile = await user.createProfile(
                  {
                    email,
                    lname: family_name,
                    pname: name,
                  },
                  { transaction: t }
                );
                // Create user's security
                await user.createSecurity({}, { transaction: t });
                if (+user?.access_level < 2) {
                  setEmailKyc(user, { transaction: t });
                }
                // Create all supported wallets for user
                await user.createSupportedWallet({
                  transaction: t,
                });

                return user;
              })
            )
            .catch((err) => {
              throw boom.internal(`Database error!`, err);
            });
          // Login user
          return user.login(user, {
            profile: profile?.toJSON(),
          });
        }

        await setEmailKyc(foundUser);

        return boom.methodNotAllowed(
          `User with email: ${email} already exist! Return to login`
        );
      } catch (err) {
        // console.log(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    /**
     * @function resendConfirmationMail
     * @returns
     */
    async resendConfirmationMail(req) {
      const {
        payload: { email },
      } = req;
      try {
        const user = await User.findOne({ where: { email } });
        if (!user)
          return boom.notFound(`Account with email, ${email} not found!`);

        const token = jwt.create(user?.id, JWT_SCOPES?.verifyEmail);

        let state = await User.sendConfirmationMail({
          to: email,
          extraComment: "",
          token,
        });
        return {
          status: true,
          message: `Mail has been sent to ${email}`,
          state,
        };
      } catch (err) {
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    /**
     *
     * @param {Object} req Request object
     * @param {Object} h Hapi object
     * @returns
     */
    async sendOTP(req, h) {
      const {
        payload,
        pre: {
          permission: { user },
        },
      } = req;

      try {
        let { type = "*", id, ...rest } = payload;

        if (id && !user) user = await User.findByPk(id);

        if (!user) throw boom.notFound(`User account not found!`);

        if (!["email", "phone", "*"].includes(type))
          throw boom.methodNotAllowed(`Invalid type`);

        return await user.sendOTP(rest, type);
      } catch (err) {
        // console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function verifyOTP - Verifies user OTP code
     * @param {Object} req
     * @returns
     */
    async verifySMSOTP(req) {
      const {
        payload: { phone: phone_number, code },
        pre: {
          permission: { user },
        },
      } = req;

      try {
        if (!code)
          throw boom.badData("required parameters are invalid or missing!");

        if (!phone_number)
          throw boom.badData("Required payload, <phone number> is missing!");

        //  Check that otp exist and is valid
        let security = await user.getSecurity();
        let isValid = compareOTPCode(new Date(), security?.otp_ttl);

        if (security?.otp === code && isValid) {
          await Kyc.findOrCreate({
            defaults: {
              status: KYC_STATUSES?.ACCEPTED,
              type: KYC_TYPES?.SMS,
              user_id: user?.id,
            },
            where: { user_id: user?.id, type: KYC_TYPES?.SMS },
          });
          await Profile.update(
            { phone: phone_number },
            { where: { user_id: user?.id } }
          );
          return { status: true };
        }
        return { status: false, message: "Invalid code" };
      } catch (err) {
        // console.error(err);
        return boom.isBoom(err) ? err : boom.internal(err.message, err);
      }
    },

    /**
     * @description confirm by email
     * @param {Object} req
     * @returns
     */
    async verifyEmailByLink(req) {
      try {
        let {
          payload: { email, token },
        } = req;

        if (!email || !token)
          return boom.notAcceptable(`Missing required payloads`);
        // decode user info from token
        const { decoded, isValid, error } = await jwt.decodeAndVerifyToken(
          token,
          JWT_SCOPES.verifyEmail
        );

        // handle token mismatch  error
        if (!isValid)
          return boom.notAcceptable(
            `Invalid Token! Unable to confirm your account!`,
            error
          );
        // get user
        let user = await User.findOne({
          where: { id: decoded?.payload?.user_id, email },
        });
        if (!user) return boom.methodNotAllowed(`Account is non-existent!`);

        let security = await user.getSecurity();
        // discontinue if an account is already verified
        if (security?.last_verified_token === token)
          return boom.badData(`Token has already been confirmed`);
        security.last_verified_token = token;

        await sequelize.transaction(async (t) => {
          // User
          user.verified = true;
          await user.save({ transaction: t });
          // Kyc
          let [foundKyc, isNew] = await Kyc.findOrCreate({
            defaults: {
              status: KYC_STATUSES.ACCEPTED,
              type: KYC_TYPES.EMAIL,
              user_id: user?.id,
            },
            where: {
              type: KYC_TYPES.EMAIL,
              user_id: user?.id,
            },
            logging: console.log,
            validate: true,
            transaction: t,
          });
          if (!isNew) {
            foundKyc.status = KYC_STATUSES.ACCEPTED;
            await foundKyc.save({ transaction: t });
          }
          return [user, foundKyc];
        });

        return {
          token: jwt.create(user?.id),
          ...user.toJSON(),
        };
      } catch (err) {
        // console.error(err);
        return boom.isBoom() ? err : boom.internal(err.message, err);
      }
    },

    /**
     * @function resetPassword
     * @param {Object} req
     * @param {Object} h
     * @returns
     */
    async changePassword(req, h) {
      let {
        payload: { new_password, old_password, token, id },
        pre: {
          permission: { user, sudo },
        },
      } = req;

      let target_user = user;
      if (!target_user) {
        if (!token)
          return boom.badData(`Token is missing. See API documentation`);
        // decrypt jwt token

        const { isValid, decoded, error } = await jwt.decodeAndVerifyToken(
          token,
          JWT_SCOPES.changePassword
        );
        // handle token mismatch  error
        if (!isValid) return boom.notAcceptable(error.message);

        // get user
        target_user = await User.findOne({
          where: { id: decoded?.payload?.user_id },
          trim: false,
        });
      }

      if (sudo && id) {
        // Reset password as an admin
        target_user = await User.findOne({ where: { id } });
      }

      if (!target_user) return boom.notFound(`User does not exist`);
      if (old_password) {
        let isSame = await decrypt(old_password, target_user?.password);
        if (!isSame)
          return boom.badData(`old password mismatch! Cannot proceed!`);
      }
      target_user.password = await encrypt(new_password);
      target_user.password_is_unknown = false;
      await target_user.save();

      return { status: true, message: "Password change completed" };
    },

    /**
     * @function requestPasswordChange
     * @param {Object} req
     * @returns
     */
    async requestPasswordChange(req, h) {
      const {
        payload: { email },
      } = req;

      try {
        const user = await User.findOne({ where: { email } });

        if (!user)
          return boom.notFound(`User with email: <${email}> not found!`);

        // Expires in 900s -> 15mins
        const token = jwt.create(user?.id, JWT_SCOPES?.changePassword);

        // generate reset password link with token
        const reset_link = new URL.URL(base_url);

        reset_link.pathname = CLIENT_ROUTES?.authChangePassword;
        reset_link.search = `token=${encodeURIComponent(token)}`;

        // Sent reset password link to email of user
        mailer?.sendMail(
          {
            template: "account_reset_password",
            transforms: {
              recipientEmail: email,
              recipientName: user?.profile?.pname,
              resetLink: reset_link,
            },
            subject: "P2PElim - Reset Password",
            to: email,
          },
          (err, info) => {
            if (err) console.error(info, error);
            else console.log(info);
          }
        );
        return h.response({ status: true, message: "Email sent" }).code(200);
      } catch (err) {
        // console.error(err);
        return boom.internal(err.message, err);
      }
    },
    /**
     * @function logout - registers or creates a new user record
     * @param {Object} req - Request object
     * @returns
     */
    async logout(req) {
      let {
        pre: {
          permission: { user },
        },
      } = req;
      return user.logout();
    },

    /**
     *
     * @param {Object} req Request Object
     * @param {Object} req.payload Request payload
     * @param {Object} req.pre Request prehandler
     * @returns
     */
    async changeEmail(req) {
      const {
        payload: { email },
        pre: {
          permission: { user },
        },
      } = req;

      try {
        if (!email)
          throw boom.badData("Required payload, <email::string> is missing!");
        let emailExist = await User.findOne({ where: { email } });
        if (emailExist)
          throw boom.badData(`The email: ${email} is already in use`);

        await Kyc.findOrCreate({
          defaults: {
            status: KYC_STATUSES?.PENDING,
            type: KYC_TYPES?.EMAIL,
            user_id: user?.id,
          },
          where: { user_id: user?.id, type: KYC_TYPES?.EMAIL },
        });
        user.email = email;
        await user.save();

        return {
          status: true,
          mail: await sendOTP({ user, email, subject: "Verify email" }),
        };
      } catch (err) {
        // console.error(err);
        return boom.isBoom(err) ? err : boom.internal(err.message, err);
      }
    },
  };
};

/**
 * @description Compares OTP codes
 * @param {String} code
 * @param {String} existing
 * @returns
 */
function compareOTPCode(code, existing) {
  let now = new Date();
  return dfn.isBefore(now, existing);
}
