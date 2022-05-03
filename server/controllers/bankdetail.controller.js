"use strict";

const BankDetailController = (server) => {
  const {
    db,
    db: { BankDetail, sequelize },
    boom,
    helpers: { filters, paginator },
  } = server.app;
  /* const queryInterface = sequelize.getQueryInterface();
      const table = Currency.getTableName(); */
  return {
    // FIND ---------------------------------------------------
    /**
     * @function get - Gets currency collection
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        pre: {
          permission: { fake },
        },
        params: { id },
      } = req;

      try {
        const queryOptions = {
          where: {
            id,
          },
          attributes: { exclude: ["user_id", "UserId"] },
        };
        let result = fake
          ? await BankDetail.FAKE()
          : await BankDetail.findOne(queryOptions);

        return result ? result : boom.notFound(`Address ID: ${id} not found!`);
      } catch (error) {
        console.error(error);
        return boom.boomify(error);
      }
    },

    async find(req) {
      const {
        query,
        pre: {
          permission: { fake },
        },
      } = req;


      try {
        const queryFilters = await filters({
          query,
          searchFields: ["bank_name",]
        });

        const queryOptions = {
          ...queryFilters,
        };

        const { limit, offset } = queryFilters;

        const queryset = fake
          ? await BankDetail.FAKE(limit)
          : await BankDetail.findAndCountAll(queryOptions);

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    // UPDATE ---------------------------------------------------
    /**
     * @function updateByID
     * @describe Update single record by ID
     * @param {Object} req
     * @returns
     */
    async updateByID(req) {

      console.log(req)

      const {
        payload,
        params: { id },
        pre: {
          permission: { sudo },
        },
      } = req;

      try {
        const queryOptions = {
          where: {
            id,
          },
          validate: true,
          returning: true,
        };

        return {
          result: await BankDetail.update(payload, queryOptions)
            .then(([count, [updated]]) => ({
              id,
              status: Boolean(count),
            }))
            .catch((err) => {
              throw boom.badData(err.message, err);
            }),
        };
      } catch (error) {
        console.error(error);
        throw boom.boomify(error);
      }
    },

    // CREATE ---------------------------------------------------

    async create(req) {
      const {
        payload,
        pre: {
          permission: { user },
        },
      } = req;

      try {
        const queryOptions = {
          fields: ["swift_code", "bank_name"],
          returning: true,
        };
        return await user.createBankdetail(payload, queryOptions);
      } catch (error) {
        console.error(error);
        return boom.isBoom(error) ? error : boom.boomify(error);
      }
    },

    // REMOVE ---------------------------------------------------

    async removeByID(req) {
      try {
        const {
          payload: { force = false },
          pre: {
            permission: { user },
          },
          params: { id },
        } = req;

        const queryOptions = {
          where: {
            id,
          },
          force,
        };

        return {
          result: await BankDetail.destroy(queryOptions)
            .then((count) => ({
              id,
              status: Boolean(count),
            }))
            .catch((err) => {
              throw boom.badData(err.message, err);
            }),
        };
      } catch (error) {
        console.error(error);
        return boom.forbidden(error);
      }
    },

    async remove(req) {
      const {
        payload: { ids = [], force = false },
        pre: {
          permission: { user },
        },
      } = req;

      try {
        let result = await sequelize.transaction(async (t) =>
          Promise.all(
            ids?.map(async (id) => {
              let queryOptions = {
                where: {
                  id,
                  user_id: user.id,
                },
                transaction: t,
                force,
              };
              return await BankDetail.destroy(queryOptions).then((count) => ({
                status: Boolean(count),
                id,
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
        return boom.forbidden(error);
      }
    },

    // RESTORE------------------------------------------------------------

    async restoreByID(req) {
      const {
        params: { id },
        pre: {
          permission: { user },
        },
      } = req;

      try {
        return {
          result: await BankDetail.restore({
            where: {
              id,
              user_id: user.id,
            },
          })
            .then((count) => ({
              id,
              status: Boolean(count),
            }))
            .catch((err) => {
              throw boom.badData(err.message, err);
            }),
        };
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function restore - bulk restore currency records
     * @param {Object} req
     */
    async restore(req) {
      const {
        payload: { data = [] },
        pre: {
          permission: { user },
        },
      } = req;

      try {
        return {
          result: await sequelize.transaction(async (t) =>
            Promise.all(
              data?.map(
                async (id) =>
                  await BankDetail.restore({
                    where: {
                      id,
                      user_id: user.id,
                    },
                  }).then((count) => ({
                    id,
                    status: Boolean(count),
                  }))
              )
            ).catch((err) => {
              throw boom.badData(err.message, err);
            })
          ),
        };
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },
  };
};

module.exports = BankDetailController;
