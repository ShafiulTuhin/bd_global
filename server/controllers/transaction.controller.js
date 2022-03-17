"use strict";
const { Op } = require("sequelize");
const { TRANSACTION_STATUS, TRANSACTION_TYPES } = require("../constants");
let walletPlugin = require("../../server/wallet.plugin");

/**
 * @description - KYC Controller helpers
 * @param {Object} server  - Hapi Server Instance
 * @returns
 */
function TransactionController(server) {
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
          searchFields: ["user_id"],
        });

        const options = {
          ...queryFilters,
          attributes: [
            "id",
            "archived_at",
            "fee",
            "quantity",
            "address",
            "type",
            "status",
            "created_at",
            "updated_at",
            "trx_id",
            "metadata"
          ],
          include: [
            {
              model: Wallet,
              as: "wallet",
              attributes: [
                "address",
                "frozen",
                "created_at",
                "updated_at",
                "network",
                "currency",
                "tatum_account_id",
                ...(sudo ? ["is_company_wallet"] : []),
              ],
              include: {
                model: User,
                as: "user",
                attributes: [
                  "id",
                  "email",
                  "verified",
                  "permission",
                  "archived_at",
                  "last_seen",
                  "login_at",
                  "access_level",
                  "online",
                  "created_at",
                  "updated_at",
                ],
              },
              ...(sudo
                ? {}
                : {
                    where: {
                      user_id: user.id,
                    },
                    required: !sudo,
                  }),
            },
          ],
        };

        const { limit, offset } = queryFilters;

        let queryset = fake
          ? await Transaction.FAKE(limit)
          : await Transaction.findAndCountAll(options);

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

    /**
     * @function findByID
     * @describe - Find record by ID
     * @param {Object} req
     * @returns
     */
    async findByID(req) {
      const {
        params: { id },
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;
      try {
        const queryFilters = await filters({
          query,
          searchFields: ["user_id"],
          extras: {
            id,
            ...(sudo ? {} : { user_id: user.id }),
          },
        });

        const options = {
          ...queryFilters,
          attributes: [
            "id",
            "archived_at",
            "fee",
            "quantity",
            "address",
            "type",
            "status",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: Wallet,
              as: "wallet",
              attributes: [
                "address",
                "frozen",
                "created_at",
                "updated_at",
                "network",
                "currency",
                "tatum_account_id",
                ...(sudo ? ["is_company_wallet"] : []),
              ],
              include: {
                model: User,
                as: "user",
                attributes: [
                  "id",
                  "email",
                  "verified",
                  "permission",
                  "archived_at",
                  "last_seen",
                  "login_at",
                  "access_level",
                  "online",
                  "created_at",
                  "updated_at",
                ],
              },
            },
          ],
        };

        let result = fake
          ? await Transaction.FAKE()
          : await Transaction.findOne(options);

        return result
          ? result
          : boom.notFound(`No transaction with ID: [ ${id} ] found`);
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },
    /**
     * @function competeTrnById
     * @describe - Find record by ID
     * @param {Object} req
     * @returns
     */
    async approveTrnById(req) {
      const {
        params: { id },
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;
      try {
        const transaction = await Transaction.findOne({
          where: {
            id,
            // status: TRANSACTION_STATUS.PENDING,
            type: TRANSACTION_TYPES.WITHDRAWAL,
          },
        });

        if (!transaction) {
          return boom.notFound(`No transaction with ID: [ ${id} ] found`);
        }

        if (transaction.status === TRANSACTION_STATUS.ACTIVE) {
          return boom.notFound(
            `transaction with ID: [ ${id} ] as already been approved`
          );
        }

        const wallet = await transaction.getWallet();
        if (!wallet) {
          return boom.notFound(
            `No wallet initiated transaction with id: [ ${id} ]`
          );
        }

        // let hasSufficientAmount = await wallet.hasSufficientAmount({
        //   amountToSend:transaction.quantity,
        //   withAffiliate:false
        // })

        if (!transaction.blockage_id) {
          throw new Error("transaction amount was not blocked");
        }
        let res;

        try {
          res = await wallet.withdrawToAddress({
            amount: transaction.quantity,
            address: transaction.address,
          });
          transaction.status = TRANSACTION_STATUS.ACTIVE;
          transaction.trx_id = res.id;

          await wallet.unfreezeWallet({ blockageId: transaction.blockage_id });
          transaction.blockage_id = null;
          await transaction.save();
        } catch (error) {
          console.log(error);
          return boom.badRequest("transaction was not successful");
        }

        let metadata = {};
        metadata.commission_earned = transaction.quantity;
        metadata.distribution_status = "SUCCESS";
        metadata.friend_trade_datetime = new Date();
        metadata.friends_user_id = wallet.user_id;
        metadata.order_type = "";
        metadata.tx_id = res.txId;
        metadata.tx_model_id = transaction.id;
        await wallet.logCommission(metadata);

        let user_ = await wallet.getUser()
        if(user_){
          await user_.emitWithdrawApproveOrDisapprove({
            io,
            transaction
          })
        }

        return transaction;
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },


    async mainToManagerTransfer(req) {

      const {
        params: { id },
        query,
        pre: {
          permission: { user, fake, sudo },
        },
        payload
      } = req;

      // console.log("mainToManagerTransfer transaction controller");
      // console.log(payload);
      // console.log(await (new walletPlugin()).getWalletPluginForAdmin(payload))
      let btcPlugin = await (new walletPlugin()).getWalletPluginForAdmin(payload)
      // console.log("==  btcPlugin");
      // console.log(btcPlugin)
      
      return btcPlugin
      // return {status:"mainToManagerTransfer controller"}
    },
    /**
     * @function disapproveTrnById
     * @describe - Find record by ID
     * @param {Object} req
     * @returns
     */
    async disapproveTrnById(req) {
      const {
        params: { id },
        query,
        pre: {
          permission: { user, fake, sudo },
        },
      } = req;
      try {
        const transaction = await Transaction.findOne({
          where: {
            id,
            status: TRANSACTION_STATUS.PENDING,
            type: TRANSACTION_TYPES.WITHDRAWAL,
          },
        });

        if (!transaction) {
          return boom.notFound(`No transaction with ID: [ ${id} ] found`);
        }

        const wallet = await transaction.getWallet();
        if (!wallet) {
          return boom.notFound(
            `No wallet initiated transaction with id: [ ${id} ]`
          );
        }

        await wallet.unfreezeWallet({ blockageId: transaction.blockage_id });

        transaction.status = TRANSACTION_STATUS.DECLINED;
        await transaction.save();

        let metadata = {};
        metadata.commission_earned = transaction.quantity;
        metadata.distribution_status = "DECLINED";
        metadata.friend_trade_datetime = new Date();
        metadata.friends_user_id = wallet.user_id;
        metadata.order_type = "";
        metadata.tx_model_id = transaction.id;
        await wallet.logCommission(metadata);
        let user_ = await wallet.getUser()

        await user_.emitWithdrawApproveOrDisapprove({
          io,
          transaction,
          message:"withdraw has been disapproved"
        })
        return { status: "success" };
      } catch (error) {
        console.error(error);
        return boom.internal(error.message, error);
      }
    },
  };
}

module.exports = TransactionController;
