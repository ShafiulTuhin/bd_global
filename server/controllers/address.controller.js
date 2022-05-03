"use strict";

function AddressController(server) {
  const { __update, __destroy } = require("./utils")(server);
  const {
    db,
    db: { Address, sequelize },
    boom,
    helpers: { paginator, filters },
  } = server.app;
  return {
    // CREATE ------------------------------------------------------------------------------------------------------
    async create(req) {
      const {
        pre: {
          permission: { user },
        },
        payload,
      } = req;
      try {
        let fields = ["country", "address_line", "zipcode"];

        const address = await user.createAddress(payload, { fields });
        return {
          operation: "Address::create",
          status: Boolean(address),
          address,
        };
      } catch (err) {
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },
    // FIND ------------------------------------------------------------------------------------------------------
    /**
     * @function findByID - Gets currency collection
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        pre: {
          permission: { user, fake, sudo },
        },
        params: { id },
      } = req;

      try {
        const queryOptions = {
          where: {
            id,
            ...(sudo && { user_id: user.id }),
          },
          attributes: { exclude: ["user_id", "UserId"] },
        };
        let result = fake
          ? await Address.FAKE()
          : await Address.findOne(queryOptions);

        return result ? result : boom.notFound(`Address ID: ${id} not found!`);
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    /**
     * @function find - Retrieves multiple advert records
     * @param {Object} req
     */
    async find(req) {
      const {
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;

      try {
        const queryFilters = await filters( {
          query,
          searchFields: ["address_line"],
          extras: {
            ...(!sudo && { user_id: user.id }),
          },
        });
        const options = {
          ...queryFilters,
        };
        const { limit, offset } = queryFilters;
        let result;
        if (sudo) {
          
          let address = await Address.findAndCountAll(options);
          result = paginator({
            address,
            limit,
            offset,
          });
        } else result = await user.getAddress();

        return fake ? await Address.FAKE(limit) : result;
      } catch (err) {
        console.error(err);
        return boom.isBoom ? err : boom.internal(err.message, err);
      }
    },

    // REMOVE ------------------------------------------------------------------------------------------------------
    /**
     * @function remove - remove mulitple records
     * @param {Object} req  - request object
     * @param {Object} req.payload  - request body
     * @returns
     */
    async remove(req) {
      const {
        payload,
        pre: {
          permission: { user },
        },
      } = req;
      try {
        let { force = false } = payload,
          result;

        result = user.setAddress([], { force });

        return {
          status: Boolean(result),
        };
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function removeByID - Remove single record by ID
     * @param {Object} req
     * @returns
     */
    async removeByID(req) {
      let {
        payload: { force = false },
        params: { id },
        pre: {
          permission: { user },
        },
      } = req;
      let where = { id, user_id: user?.id };
      let result = await __destroy("Address", where, force);
      return { status: Boolean(result), result, id };
    },

    // UPDATE------------------------------------------------------------------------------------------------------

    /**
     * @function updateByID
     * @describe update single records by ID
     * @param {Object} req
     */
    update: async (req) => {
      try {
        const {
          payload,
          pre: {
            permission: { user },
          },
        } = req;
        let fields = ["country", "address_line", "zipcode"];

        const options = {
          where: {
            user_id: user?.id,
          },
          fields,
        };
        let address = await user.getAddress();

        const result = await address.update(payload);

        return {
          operation: "Address::update",
          status: Boolean(result),
        };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },
    /**
     * @function updateByID
     * @describe update single records by ID
     * @param {Object} req
     */
    async updateByID(req) {
      try {
        const {
          params: { id },
          payload,
          pre: {
            permission: { user },
          },
        } = req;
        let fields = ["country", "address_line", "zipcode"];

        const options = {
          where: {
            user_id: user?.id,
            id,
          },
          fields,
        };

        const result = await Address.update(payload, options);
        return {
          id,
          status: Boolean(result),
        };
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },
  };
}

module.exports = (server) => AddressController(server);
