"use strict";
const { Op } = require("sequelize");
const { TRANSACTION_STATUS, TRANSACTION_TYPES } = require("../constants");
let walletPlugin = require("../../server/wallet.plugin");

/**
 * @description - KYC Controller helpers
 * @param {Object} server  - Hapi Server Instance
 * @returns
 */
function ManagerTransactionController(server) {
    const {
        db: { Transaction, Wallet, User,ManagerTransaction },
        boom,
        helpers: { filters, paginator },
        io
    } = server.app;
    return {
        // FIND ------------------------------------------------------------------------------------------------------
        /**
         * @function find
         * @describe - Find multiple records
         * @param {Object} req
         * @returns
         */
        async create(req) {
            const {
                payload,
                // query: { fake = false, sudo },
                pre: {
                    permission: { user, fake = false, sudo },
                }
            } = req;
            console.log("ManagerTransactionController create");
            console.log(payload)

            try {
                // const object = await ManagerTransaction.create({
                //     ...payload,
                // });

                // return await filterFields({
                //     object: object.dataValues,
                //     exclude: ["user_id", "deleted_at", "UserId", "user_id", "updatedAt", "created_by"],
                // });

                return { "status": "return from ManagerTransactionController" }

            } catch (error) {
                console.error(error);
                throw boom.boomify(error);
            }
        },

        async find(req) {
            const {
              query,
              pre: {
                permission: { user, fake, sudo },
              },
            } = req;
            try {
              /* const include = validateAndFilterAssociation(
                query?.include,
                ["security"],
                User
              ); */
              const queryFilters = await filters({
                query,
                //searchFields: ["user_id"],
              });
      
              const options = {
                ...queryFilters,
                attributes: [
                  "id",
                  "crypto",
                  "quantity",
                  "address",
                  "type",
                  "status",
                  "created_at",
                  "metadata"                
                ],
                
              };
      
              const { limit, offset } = queryFilters;
      
              let queryset = fake
                ? await ManagerTransaction.FAKE(limit)
                : await ManagerTransaction.findAndCountAll(options);
      
              return paginator({
                queryset,
                limit,
                offset,
              });
            } catch (error) {
              console.error(error);
              return boom.internal(error.message, error);
            }
          },

    };
}

module.exports = ManagerTransactionController;
