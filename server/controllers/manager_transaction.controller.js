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
        db: { Transaction, Wallet, User },
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





    };
}

module.exports = ManagerTransactionController;
