"use strict";

const {
  Op
} = require("sequelize");
const {
  TRANSACTION_TYPES,
  TRANSACTION_STATUS
} = require("../constants");

module.exports = function WalletController(server) {
  /*********************** HELPERS ***************************/
  /*  const {  __update, __destroy } = require("./utils")(
    server
  ); */

  const {
    db,
    db: {
      Wallet,
      User,
      Fee
    },
    boom,
    helpers: {
      filters,
      paginator
    },
    io
  } = server.app;

  /* const walletExist = async (address, user) => {
    // Search wallet by address
    return await Wallet.findOne({
      where: { address, ...(() => (user ? { owner_id: user } : null))() },
    });
  }; */

  return {
    async create(req) {
      const {
        pre: {
          permission: {
            user,
            sudo
          },
        },
        params: {
          currency
        },
      } = req;
      return await User.findByPk(user)
        .createWallet({
          asset: currency
        })
        .toPublic();
    },

    // FIND ----------------------------------------
    async find(req) {
      let {
        pre: {
          permission: {
            user,
            sudo,
            fake
          },
        },
        query,
      } = req;

      try {
        const queryFilters = await filters({
          query,
          searchFields: ["account_id"],
          extras: {
            ...(!sudo && {
              user_id: user?.id
            }),
          },
        });
        const options = {
          ...queryFilters,
          ...(sudo && {
            include: {
              model: User,
              as: "user",
            },
          }),
        };

        const {
          limit,
          offset
        } = queryFilters;
        let queryset = fake ?
          Wallet.FAKE(limit) :
          await Wallet.findAndCountAll(options);

        // for testing
        // console.log("wallet controller upper find   ======================= ");
        // let a = await queryset.rows[5].checkAndTransferToMasterAddress();
        // console.log(a);
        if (!fake) {
          queryset.rows = await Promise.all(
            queryset.rows.map(async (wallet) => {
              let {
                availableBalance
              } = wallet?.getDataValue("balance") || {
                availableBalance: 0,
              };
              let currentDate = new Date(),
                next_check_deposit_date = wallet.getDataValue("next_check_deposit_date");
              let allow = !next_check_deposit_date ||
                (next_check_deposit_date &&
                  new Date(next_check_deposit_date) < currentDate);

              if (
                Number(availableBalance) > wallet.getDataValue("total_success_deposit") &&
                allow
              ) {
                await wallet.checkAndTransferToMasterAddress();
              }

              wallet.setDataValue('balance', {
                accountBalance: wallet.total_balance,
                availableBalance: wallet?.available_balance
              });
              // wallet.balance.accountBalance = String(
              //   wallet.total_balance
              // );
              // wallet.balance.availableBalance = String(
              //   wallet.available_balance
              // );
              return wallet;
            })
          );
        }

        queryset.rows = queryset.rows.map((data) => data.toPublic());

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
     * @function findByAddress - Find wallet by address
     * @param {Object} req
     * @returns
     */
    async findByAddress(req) {
      let {
        pre: {
          permission: {
            user,
            sudo,
            fake
          },
        },
        params: {
          address
        },
      } = req;

      try {
        const options = {
          where: {
            address,
            ...(!sudo & {
              user_id: user?.id
            })
          },
          // attributes:[
          //   "id",
          //   "memo",
          //   "destination_tag",
          //   "address",
          //   "network",
          //   "frozen",
          //   "currency"
          // ]
        };
        let result = fake ? Wallet.FAKE() : await Wallet.findOne(options);

        return result ?
          result :
          boom.notFound(`Wallet address: ${address} not found!`);
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },

    async depositAsset(req) {},
    async depositWebhook(req) {
      let {
        params: {
          token
        },
        payload: {
          amount,
          date,
          currency,
          id,
          reference,
          txId,
          blockHash,
          blockHeight,
          from,
          to,
          index,
        },
      } = req;

      try {
        if (token !== process.env.WEBHOOK_TOKEN) {
          return boom.forbidden("invalid token");
        }

        if (!to || !amount) {
          return boom.badRequest("bad request");
        }

        console.log("am called here", amount);

        const wallet = await Wallet.findOne({
          where: {
            address: to,
          },
        });

        if (!wallet) return boom.notFound("wallet not found");
        console.log("webhook called");
        const {
          masterAddress
        } = await wallet.getWalletKeys();
        console.log("got master address", masterAddress, {
          amount,
          from: to,
          to: masterAddress,
        });
        let transactionFee = await wallet.getTransactionFee({
          amount,
          from: to,
          to: masterAddress,
        });
        console.log("transaction fee", transactionFee);
        if (transactionFee >= amount) return {
          status: "sucess"
        };

        let transaction = await wallet.checkAndTransferToMasterAddress({
          amount,
        });

        console.log("transaction", transaction);

        return {
          status: "success",
          message: "deposit completed"
        };
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },
    async withdrawAsset(req) {
      let {
        pre: {
          permission: {
            user,
            sudo,
            fake
          },
        },
        payload: {
          from,
          to,
          amount
        },
      } = req;

      try {
        if (fake) return {
          status: "success"
        };

        const [wallet, ...rest] = await user.getWallets({
          where: {
            address: from,
            tatum_account_id: {
              [Op.not]: null,
            },
            user_id: user.id,
            is_company_wallet: false,
          },
        });

        if (!wallet) return boom.notFound("wallet not found");

        const sufficientAmount = await wallet.hasSufficientAmount({
          amountToSend: amount,
          withAffiliate: true,
        });

        if (!sufficientAmount)
          return boom.forbidden(
            "wallet you do not have sufficient balance on ypur wallet"
          );

        let cryptofee = await Fee.findOne({
          where: {
            crypto: wallet?.dataValues?.currency,
            type: 'WITHDRAWAL',
          }
        });

        // console.log("cryptofee : ",cryptofee);
        // console.log("cryptofee : ",amount);
        // return cryptofee
        let totalQnt;
        if (cryptofee?.dataValues?.amount_in_percent) {
          totalQnt = parseFloat(parseFloat(amount) + parseFloat(cryptofee?.dataValues?.amount_in_percent))
        } else {
          totalQnt = parseFloat(amount);
        }

        // console.log("totalQnt : ",totalQnt);
        // return totalQnt
        const {
          dataValues: {
            id
          },
        } = await wallet.freezeWallet({
          quantity: totalQnt
        });
        if (!id) return boom.badRequest("transaction not successfull");
        let transaction = await wallet.createTransaction({
          fee: cryptofee?.dataValues?.amount_in_percent,
          blockage_id: id,
          quantity: amount,
          address: to,
          type: TRANSACTION_TYPES.WITHDRAWAL,
          status: TRANSACTION_STATUS.PENDING,
          user_id: user.id,
        });

        await user.emitWithdrawal({
          io,
          user,
          transaction
        })
        // await User.emitAdminBulkNewWithdrawRequest({
        //   io,
        //   transaction
        // })

        return {
          status: "success",
          message: "transaction awaiting approval"
        };
      } catch (err) {
        console.error(err);
        return boom.isBoom(err) ? err : boom.boomify(err);
      }
    },
  };
};