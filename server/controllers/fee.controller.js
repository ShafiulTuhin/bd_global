"use strict";

const boom = require("@hapi/boom");
const { filterFields } = require("../services/model");

const FeeController = (server) => {
  const {
    db,
    db: { Fee,sequelize },
    helpers: { filters, paginator },
  } = server.app;

  return {
    // CREATE ------------------------------------------------------------

    /**
     * @function create - Creates a single chat history
     * @param {Object} req
     * @returns
     */
    
    async create(req) {
      const { 
        payload,
        // query: { fake = false, sudo },
        pre:{
          permission: {user, fake = false, sudo },
        }
       } = req;

      try {
        return await (fake? Fee.FAKE() :  user.createFee(payload));
        
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    //   RETRIEVE ------------------------------------------------------

    /**
     * @function retrieve - Retrieves a single chat history collection
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        params: { id },
        pre:{
          permission: {fake = false },
        }
      } = req;

      try {
        if (fake) return await Fee.FAKE();

        const fee = await Fee.findOne({
          where: {
            id,
          },
          attributes: { exclude: ["deleted_at"] },
        });

        if (!fee) {
          throw boom.notFound();
        }
        return fee;
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    /**
     * @function find - Retrieves multiple chat history collection
     * @param {Object} req
     * @returns
     */
    async find(req) {
      try {
        const {
          query,
          pre: {
            permission: {user, fake },
          },
        } = req;

        const queryFilters = await filters({
          query,
          searchFields: ["fiat","crypto","type"],
        });

        const options = {
          ...queryFilters,
        };
        const { limit, offset } = queryFilters;
        let queryset = fake
          ? await Fee.FAKE(limit)
          : await Fee.findAndCountAll(options);

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    // UPDATE ----------------------------------------------------------

    // REMOVE ----------------------------------------------------------
    async removeByID(req) {
      const {
        params: { id },
      } = req;

      try {
        const result = await Fee.destroy({
          where: {
            id,
          },
        });

        if (!result) throw boom.notFound();

        return null;
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

  // REMOVE
    /**
     * @function remove - Remove Multiple currency record
     * @param {Object} req
     * @returns
     */
     async remove(req) {
      const {
        payload: { ids = [], force = false },
        pre: {
          permission: {user, sudo, fake },
        },
      } = req;

      if (!sudo)
        return boom.methodNotAllowed(
          `Only authorized users can access this route`
        );

      try {
        let result = await sequelize.transaction(async (t) =>
          Promise.all(
            ids?.map(async (id) => {
              let queryOptions = {
                where: {
                  id,
                },
                transaction: t,
                force,
              };
              return await Fee.destroy(queryOptions).then((result) => ({
                id,
                status: Boolean(result),
              }));
            })
          ).catch((err) => {
            throw boom.badData(err.message, err);
          })
        );
        return {
          result,
        };
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },
    // UPDATE------------------------------------------------------------
    /**
     * @function updateByID - Updates single currency
     * @param {Object} req
     * @returns
     */
     async updateByID(req) {

      const {
        payload,
        params: { id },
        pre: {
          permission: {user, sudo, fake },
        },
      } = req;

      try {
        if (!sudo)
          return boom.methodNotAllowed(
            `Only authorized users can access this route`
          );

        const queryOptions = {
          where: {
            id
          },
          validate: true,
          returning: true,
          fields: ["fait", "cypto", "type","amount_in_percent"],
          // logging: console.log,
        };

        return await Fee.update(payload, queryOptions)
        
          .then(([count, [updated]]) => ({
            id,
            status: Boolean(count),
          }))
          .catch((err) => {
            throw boom.badData(err.message, err);
          });
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.internal(error);
      }
    },
  };
};

module.exports = FeeController;
