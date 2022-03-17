"use strict";

const constants = require("../constants");
const {Op} = require("sequelize")


function LoggerController(server) {
  const {
    db,
    db: { Logger, sequelize },
    helpers: { filters, paginator },
    boom,
  } = server.app;

  return {
    /**
     * @function find - Get multiple Currencies
     * @param {Object} req
     * @returns
     */
    async find(req) {
      const {
        query,
        pre: {
          permission: {user, sudo },
        },
      } = req;

      try {
        const queryFilters = await filters({
          query,
          searchFields: ["user_id", "type"],
          extras:{
            ...(!sudo&&{
              type:{
                [Op.in]:[constants.LOG_TYPES.COMMISSION]
              },
              user_id:user.id
            })
          }
        });
        const { fake } = query;

        const queryOptions = {
          ...queryFilters,
          
        };
        

        const { limit, offset } = queryFilters;
        let queryset = fake
          ? await Logger.FAKE(limit)
          : await Logger.findAndCountAll(queryOptions);

        return paginator({
          queryset,
          limit,
          offset,
        });
      } catch (error) {
        console.error(error);
         return boom.isBoom(error) ? error : boom.boomify(error.message, error);
      }
    },
  };
}

module.exports = LoggerController;
