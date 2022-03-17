"use strict";
const { Op } = require("sequelize");

module.exports = function SecessionController(server) {
  const {
    db,
    db: { Secession },
    boom,
    helpers: { filters, paginator, validateAndFilterAssociation },
  } = server.app;

  return {
    // CREATE ---------------------------------------------------------------

    async create(req) {
      const {
        payload,
        pre: {
          permission: { user, sudo },
        },
      } = req;

      return await user.createSecession(payload);
    },

    // FIND ---------------------------------------------------------------
    /**
     * @function find - find multiple records
     * @param {Object} req
     * @returns
     */
    async find(req) {
      const {
        query,
        pre: {
          permission: { user, sudo, fake },
        },
      } = req;
      try {
        const include = validateAndFilterAssociation(
          query?.include,
          ["user"],
          Secession
        );
        // validate and get query filters
        const queryFilters = await filters( {
          query,
          include,
          searchFields: ["status", "description"],
          ...(!sudo && {
            extra: {
              user_id: user?.id,
            },
          }),
        });
        // define model includes

        // define query options
        const options = {
          ...queryFilters,
          include,
        };
        const { limit, offset } = queryFilters;

        const result = fake
          ? Secession.FAKE(limit)
          : await Secession.findAndCountAll(options);

        return await paginator({
          queryset: result,
          limit,
          offset,
        });
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function retrieve - retrieves a single currency record
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      try {
        const {
          params: { id },
          pre: {
            permission: { user, fake, sudo },
          },
        } = req;
        const options = {
          where: { id, ...(!sudo && { user_id: user?.id }) },
        };
        let result = fake ? Secession.FAKE() : await Secession.findOne(options);

        return result
          ? result
          : boom.notFound(`Secession with ID: ${id} not found!`);
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    // REMOVE ---------------------------------------------------------------

    async removeByID(req) {
      const {
        params: { id },
        pre: {
          permission: { user, sudo },
        },
      } = req;

      if (!sudo) throw boom.forbidden();

      return await Secession.destroy({
        where: { id },
      });
    },

    async remove(req) {
      const {
        pre: {
          permission: { user, sudo },
        },
        payload,
      } = req;

      if (!sudo) throw boom.forbidden();

      return await Secession.destroy({
        where: {
          id: {
            [Op.in]: payload,
          },
        },
      });
    },

    // UPDATE ---------------------------------------------------------------
    /**
     * @function update - Update single secession record
     * @param {Object} req
     * @returns
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

        const options = {
          where: {
            id,
            ...(!sudo && { user_id: user?.id }),
          },
        };
        let result = await Secession.update(payload, options).then(
          ([affectedRows]) => affectedRows
        );

        return {
          id,
          status: Boolean(result),
        };
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },
  };
};
