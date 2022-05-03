"use strict";

const SecurityController = (server) => {
  const { __update, __destroy } = require("./utils")(server);
  const { db,
    db: { Security, sequelize },
    boom,
    helpers: { paginator, filters, validateAndFilterAssociation },
  } = server.app;

  return {
    // FIND ---------------------------------------------------------------
    /**
     * @function find
     * @describe finds multiple records or current session's user record
     * @param {Object} req
     */
    async find(req, h) {
      const {
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;

      try {
        const include = validateAndFilterAssociation(
          query?.include,
          ["user"],
          Security
        );
        const queryFilters = await filters( {
          query,
          searchFields: ["user_id"],
        });
        const options = {
          ...queryFilters,
          include,
        };
        const { limit, offset } = queryFilters;

        if (sudo) {
          let queryset = fake
            ? await Security.FAKE(limit)
            : await Security.findAndCountAll(options);

          return paginator({
            queryset,
            limit,
            offset,
          });
        }
        let data = fake
          ? await Security.FAKE()
          : await user?.getSecurity(options);

        return h.response(data?.dataValues).code(200);
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function findByID
     * @describe finds record with matching user ID
     * @param {Object} req
     */
    async findByID(req) {
      const {
        query,
        params: { id },
        pre: {
          permission: { user, fake, sudo, fake_count },
        },
      } = req;

      try {
        const queryFilters = await filters( {
          query,
          searchFields: ["user_id"],
          extras: {
            id,
            ...(!sudo && { user_id: user?.id }),
          },
        });

        const include = validateAndFilterAssociation(
          query?.include,
          ["user"],
          Security
        );

        const options = {
          ...queryFilters,
          include,
        };

        let result = fake
          ? await Security.FAKE()
          : await Security?.findOne(options);
        return result
          ? result
          : boom.notFound(`Security with ID: ${id} not found!`);
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    // CREATE ---------------------------------------------------------------

    /**
     * @function create - create new record
     * @param {Object} req
     */
    async create(req) { },

    // UPDATE ---------------------------------------------------------------

    /**
     * @function update
     * @describe update multiple records or current session's user record
     * @param {Object} req
     */
    async update(req) {
      try {
        const {
          payload,
          pre: {
            permission: { user, fake, sudo, fake_count },
          },
        } = req;
        let fields = ["two_factor"],
          result;

        if (sudo) {
          let { ids = [], ...data } = payload;

          if (!ids?.length) throw boom.badData(`<ids::array> cannot be empty`);
          if (!data) return boom.methodNotAllowed("Nothing to update");

          result = await sequelize.transaction(async (t) => {
            return await Promise.all(
              ids.map(
                async (id) =>
                  await Promise.all([
                    __update("Security", data, {
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
          result = await Security?.update(payload, {
            where: { user_id: user?.id },
            fields,
          });
        }
        return {
          result,
        };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     * @function updateByID
     * @describe update record using the user ID
     * @param {Object} req
     */
    async updateByID(req) {
      try {
        const {
          payload,
          params: { id },
          pre: {
            permission: { user, sudo },
          },
        } = req;
        let fields = sudo ? ["two_factor"] : ["confirmations"];

        // update session user data
        let result = await Security?.update(payload, {
          where: { id, ...(!sudo && { user_id: user?.id }) },
          fields,
        });

        return {
          status: Boolean(result),
          result,
        };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // REMOVE ---------------------------------------------------------------

    /**
     * @function remove
     * @describe remove multiple records or current session's user record
     * @param {Object} req
     */
    async remove(req) {
      const {
        payload: { data = [], force = false },
        pre: {
          permission: { user, fake, sudo, fake_count },
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
                  where = { id };
                  return await Security.destroy({
                    where,
                    force,
                    transaction: t,
                  });
                }),
              ]).catch((err) => (error = err))
          );
        } else {
          where = { id: user?.id };
          result = await Security.destroy({
            where: { user_id: user?.id },
            force,
          });
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
     * @function removeByID
     * @describe find record by ID and remove if found
     * @param {Object} req
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
      let where = { id, ...(!sudo && { user_id: user?.id }) };
      let result = await __destroy("Security", where, force);
      return { status: Boolean(result), result };
    },
  };
};

module.exports = SecurityController;
