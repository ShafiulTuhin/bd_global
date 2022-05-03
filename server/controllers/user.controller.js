"use strict";
// const assert = require("assert");
const { Op } = require("sequelize");

/**
 * @description - User controller
 * @param {Object} server  - Server instance
 * @returns
 */
module.exports = function UserController(server) {
  /*********************** HELPERS ***************************/
  const { __update, __destroy } = require("./utils")(server);

  const {
    db,
    db: {
      User,
      sequelize,
      // Sequelize: { Op },
    },
    boom,

    helpers: { paginator, filters, validateAndFilterAssociation },
  } = server.app;

  return {
    // CREATE------------------------------------------------------------
  
    /**
     * @function Create
     * @description Create new user
     * @param {Object} req
     * @returns
     */
    async create(req) {
      let {
        payload,
        pre: {
          permission: { user },
        },
      } = req;

      try {
        return User.register(payload, user);
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // UPDATE------------------------------------------------------------

    /**
     * @function update - updates single user record - (**only Admin**)
     * @param {Object} req
     * @param {Object} req.payload
     * @param {Object} req.payload.data  - upsert record
     * @returns
     */
    async updateByID(req) {
      try {
        let {
          payload,
          params: { id },
          pre: {
            permission: { user, sudo },
          },
        } = req;
        let fields = ["permission", "active"];
        let result = await User.update(payload, {
          where: { id },
          returning: true,
          fields,
          logging: console.log,
        }).then(([count]) => count);

        return sudo
          ? {
              id,
              status: Boolean(result),
            }
          : boom.methodNotAllowed(
              `User with ID ${user?.id} is not an administrator`
            );
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     * @function update - updates user records
     * @param {Object} req
     * @param {Object} req.payload
     * @param {Array} req.payload.data  - array of upsert records
     * @returns
     */
    async update(req) {
      try {
        const {
          payload,
          pre: {
            permission: { user, sudo },
          },
        } = req;
        let fields = ["active"],
          result;

        if (sudo) {
          let { ids = [], ...data } = payload;
          fields = [...fields, "permission"];
          if (!ids?.length) throw boom.badData(`<ids::array> cannot be empty`);

          if (!data) return boom.methodNotAllowed("Nothing to update");

          result = await sequelize.transaction(async (t) => {
            return await Promise.all(
              ids.map(
                async (id) =>
                  await Promise.all([
                    __update("User", data, {
                      where: { id },
                      transaction: t,
                      fields,
                    }),
                  ])
              )
            );
          });
        } else {
          // update session user data
          result = await user?.update(payload, {
            fields,
          });
        }
        return {
          status: Boolean(result),
          result,
        };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // DELETE------------------------------------------------------------
    /**
     * @function remove - remove mulitple User records
     * @param {Object} req  - request object
     * @param {Object} req.payload  - request body
     * @param {Array} req.payload.data  - array of ids
     * @returns
     */
    async remove(req) {
      const {
        payload: { data = [], force = false },
        pre: {
          permission: { user, sudo },
        },
      } = req;
      let result, where;
      try {
        if (sudo) {
          if (!data?.length)
            throw boom.badData("Expected an array of user IDs. None provided!");
          result = await sequelize.transaction(
            async (t) =>
              await Promise.all([
                data.map(async (id) => {
                  if (id === user?.id)
                    throw boom.methodNotAllowed(
                      "Cannot remove current user session data. Remove current user ID from data and try again or make request without sudo, force and data as request payloads!"
                    );
                  where = { id };
                  return await User.destroy({ where, force, transaction: t });
                }),
              ]).catch((err) => (error = err))
          );
        } else {
          where = { id: user?.id };
          result = await user.destroy({ force });
        }

        return {
          status: Boolean(result),
          result,
        };
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function remove - Remove single record by ID
     * @param {Object} req
     * @returns
     */
    async removeByID(req) {
      let {
        payload: { force = false },
        params: { id },
        pre: {
          permission: { user, sudo },
        },
      } = req;
      // only superadmins are allowed to permanently delete a user
      force = user?.isSuperAdmin ? force : false;
      let where = { id };
      let result = await __destroy("User", where, force);
      return { status: Boolean(result), result };
    },

    // FIND------------------------------------------------------------

    /**
     * @function find - Fetched multiple User
     * @param {Object} req
     * @returns
     */
    async find(req) {
      const {
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;

      try {
        /*  const include = validateAndFilterAssociation(
           query?.include,
           [
             "security",
             "orders",
             "address",
             "kyc",
             "secessions",
             "uploads",
             "wallets",
             "adverts",
           ],
           User
         ); */
        const queryFilters = await filters({
          query,
          searchFields: User.searchFields,
          extras: {
            ...(!sudo
              ? { id: user?.id }
              : {
                  access_level: {
                    [Op.lt]: user?.access_level,
                  },
                }),
          },
        });

        const options = {
          ...queryFilters,
        };
        const { limit, offset } = queryFilters;

        if (sudo) {
          let queryset = fake
            ? await User.FAKE(limit)
            : await User.findAndCountAll(options);

          return paginator({
            queryset,
            limit,
            offset,
          });
        }

        return fake ? await User.FAKE() : await User.findOne(options);
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error);
      }
    },

    /**
     * @function findByID - gets single User
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        params: { id },
        pre: {
          permission: { fake, sudo },
        },
      } = req;
      try {
        // handle invalid params <id> 400
        if (!id)
          return boom.badData(
            `Required params id is ${id}. Check id value and try again!`
          );

        if (sudo) {
          let target_user = fake
            ? await User.FAKE()
            : await User.findOne({
                where: { id },
              });

          return target_user
            ? target_user
            : boom.notFound(`User with ID: ${id} does not exist!`);
        }
        return boom.unauthorized("You are not authorized to access this data");
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },
  };
};
