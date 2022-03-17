"use strict";

const ProfileController = (server) => {
  const { __update, __destroy } = require("./utils")(server);
  const {
    db,
    db: { Profile, sequelize },
    boom,
    helpers: { paginator, filters },
  } = server.app;

  return {
    // FIND ---------------------------------------------------------------
    /**
     * @function find
     * @describe finds multiple records or current session's user record
     * @param {Object} req
     */
    async find(req) {
      const {
        query,
        pre: {
          permission: {user, fake, sudo },
        },
      } = req;

      try {
        const queryFilters = await filters({
          query,
          searchFields: ["email"],
          extras: {
            ...(!sudo && { user_id: user?.id }),
          },
        });

        const options = {
          ...queryFilters,
        };

        const { limit, offset } = queryFilters;

        if (sudo) {
          let queryset = fake
            ? await Profile.FAKE(limit)
            : await Profile.findAndCountAll(options);

          return paginator({
            queryset,
            limit,
            offset,
          });
        }
        return fake ? await Profile.FAKE() : await user?.getProfile();
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function findByID
     * @describe finds record with matching ID
     * @param {Object} req
     */
    async findByID(req) {
      const {
        query,
        params: { id },
        pre: {
          permission: {user, fake, sudo },
        },
      } = req;

      try {
        const queryFilters = await filters({
          query,
          searchFields: ["email"],
          extras: {
            profile_id: id,
            ...(!sudo && { user_id: user?.id }),
          },
        });
        const options = {
          ...queryFilters,
        };
        let result = fake
          ? await Profile.FAKE()
          : await Profile?.findOne(options);

        return result
          ? result
          : boom.notFound(`Profile with ID: ${id} not found!`);
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

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
            permission: {user, sudo },
          },
        } = req;
        let fields = [],
          result;

        if (sudo) {
          let { ids = [], ...data } = payload;

          if (!ids?.length) throw boom.badData(`<ids::array> cannot be empty`);
          if (!data) return boom.methodNotAllowed("Nothing to update");
          fields = [...fields, "suitability", "verified"];
          return await sequelize.transaction(
            async (t) =>
              await Promise.all(
                ids.map(async (id) => ({
                  id,
                  ...(await __update("Profile", data, {
                    where: { profile_id: id },
                    transaction: t,
                    fields,
                  })),
                }))
              )
          );
        } else {
          // update session user data
          fields = [
            ...fields,
            "mode",
            "phone",
            "payment_methods",
            "pname",
            "oname",
            "lname",
            "gender",
            "date_of_birth",
          ];

          result = await Profile?.update(payload, {
            where: { user_id: user?.id },
            fields,
          }).then(([count]) => count);
        }
        return {
          id: user?.id,
          status: Boolean(result),
        };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     * @function updateByUserID
     * @describe update record using the user ID
     * @param {Object} req
     */
    async updateByID(req) {
      try {
        const {
          payload,
          params: { id },
          pre: {
            permission: {user, sudo },
          },
        } = req;
        let fields = [
            "mode",
            "phone",
            "payment_methods",
            "pname",
            "oname",
            "lname",
            "date_of_birth",
          ],
          result;

        const options = {
          where: { profile_id: id, ...(!sudo && { user_id: user?.id }) },
          fields,
        };

        // update session user data
        result = await __update("Profile", payload, options).catch((err) => {
          throw boom.internal(err.message);
        });

        return {
          id,
          status: Boolean(result),
        };
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    /**
     * @function remove
     * @describe remove multiple records or current session's user record
     * @param {Object} req
     */
    async remove(req) {
      const {
        payload: { data = [], force = false },
        pre: {
          permission: {user, sudo },
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
                  return await Profile.destroy({
                    where,
                    force,
                    transaction: t,
                  });
                }),
              ]).catch((err) => (error = err))
          );
        } else {
          where = { id: user?.id };
          result = await Profile.destroy({
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
          permission: {user, sudo },
        },
      } = req;
      // only superadmins are allowed to permanently delete a user
      force = user?.isSuperAdmin ? force : false;
      let where = { id };
      let result = await __destroy("Profile", where, force);
      return { status: Boolean(result), result };
    },

    /**
     * @function removeByUserID
     * @describe find record by user ID and remove if found
     * @param {Object} req
     */
    async removeByUserID(req) {
      let {
        payload: { force = false },
        params: { user_id },
        pre: {
          permission: {user, sudo },
        },
      } = req;

      try {
        // only superadmins are allowed to permanently delete a user
        force = user?.isSuperAdmin ? force : false;
        let where = { user_id };
        let result = await __destroy("Profile", where, force);
        return { status: Boolean(result), result };
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },
  };
};

module.exports = ProfileController;
