"use strict";
const { Model } = require("sequelize");
const _ = require("underscore");
const {
  TABLE_NAMES,
  SUPPORTED_TOKENS,
  LOG_TYPES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  TRANSACTION_REASON,
} = require("../../constants");
const hooks = require("../hooks/wallet.hook");
const faker = require("faker");
let walletPlugin = require("../../wallet.plugin");

const all_currencies_names = {
  ...SUPPORTED_TOKENS,
  // ...SUPPORTED_FIAT,
};
const all_currencies_codes = Object.keys(all_currencies_names);

module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { User, Wallet } = models;
      // User
      Wallet.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
      });
      User.hasMany(Wallet);
    }

    static generateCompanyWallets = async () => {
      const companyWallets = await this.findAll({
        where: {
          is_company_wallet: true,
        },
      });
      const presentCurrencies = companyWallets.map((c) =>
        c.dataValues.currency.toUpperCase()
      );

      const currenciesNotPresent = Object.keys(SUPPORTED_TOKENS).filter(
        (currency) => !presentCurrencies.includes(currency) && currency != "USDT"
      );

      await Promise.all(
        currenciesNotPresent.map((currency) => {
          return this.create({ currency, is_company_wallet: true });
        })
      ).then(async (data) => {
        if (!presentCurrencies.includes("USDT") && process.env.NODE_ENV != "development") {
          let ethWallet, payload
          payload = {}
          ethWallet = data.find(wallet => String(wallet.currency).toUpperCase() === "ETH")
          if (ethWallet) {
            payload = {
              signature_id: ethWallet.signature_id,
              tatum_account_id: ethWallet.tatum_account_id,
              memo: ethWallet.memo,
              mnemonic: ethWallet.mnemonic,
              destination_tag: ethWallet.destination_tag,
              derivation_key: ethWallet.derivation_key,
              address: ethWallet.address,
              network: ethWallet.network,
              frozen: ethWallet.frozen
            }
          }
          await this.create({ currency: "USDT", is_company_wallet: true, payload })
        }

      })
      return { status: "success" };
    };

    static FAKE(count) {
      let rows = [],
        result = {},
        index = 0;
      let generateFakeData = () => {
        let currencyCode = faker.helpers.randomize(all_currencies_codes);
        let amount = faker.finance.amount();
        const { User } = this.sequelize.models;
        return {
          id: faker.datatype.uuid(),
          address: faker.finance.bitcoinAddress(),
          frozen: faker.datatype.boolean(),
          createdAt: faker.datatype.datetime(),
          updatedAt: faker.datatype.datetime(),
          is_company_wallet: false,
          currency: currencyCode,
          account: {
            balance: {
              accountBalance: amount,
              availableBalance: faker.helpers.randomize([
                amount - 100,
                amount - 200,
                amount,
                amount - 50,
              ]),
            },
            currency: currencyCode,
            frozen: faker.datatype.boolean(),
            active: faker.datatype.boolean(),
            customerId: faker.datatype.uuid(),
            xpub: `xpub${faker.finance.bitcoinAddress()}`,
          },
          user: User.FAKE(),
        };
      };
      if (count > 1) {
        for (; index < count; ++index) {
          rows.push(generateFakeData());
        }
        result = { count, rows };
      } else result = { ...generateFakeData() };
      return result;
    }

    /**
     *
     * @returns {Promise<Number>}
     */
    updateBalance = async ({ transaction = null, commit = true } = {}) => {
      let { Transaction, Blockage, ManagerTransaction } = sequelize.models

      let creditTotal = await Transaction.sum(
        "quantity",
        {
          where: {
            status: TRANSACTION_STATUS.ACTIVE,
            type: TRANSACTION_TYPES.CREDIT,
            wallet_id: this.id
          }
        }
      )

      let debitTotal = await Transaction.sum(
        "quantity",
        {
          where: {
            status: TRANSACTION_STATUS.ACTIVE,
            type: TRANSACTION_TYPES.DEBIT,
            wallet_id: this.id
          }
        }
      )
      let creditMainTotal = 0;
      // let creditMainTotal = await ManagerTransaction.sum(
      //   "quantity",
      //   {
      //     where: {
      //       status: TRANSACTION_STATUS.ACTIVE,
      //       type: TRANSACTION_TYPES.DEBIT,
      //       reason: TRANSACTION_REASON.MANAGER_WITHDRAWAL,
      //       crypto: this.currency,
      //       tag: this.destination_tag ? this.destination_tag : null,
      //     }
      //   }
      // )



      //  return result


      let blockAmount = await Blockage.sum(
        "quantity",
        {
          where: {
            active: true,
            wallet_id: this.id
          }
        }
      )

      // let blockFee = await Blockage.sum(
      //   "fee",
      //   {
      //     where:{
      //       active:true,
      //       wallet_id:this.id
      //     }
      //   }
      // )
      let totalBalance = creditTotal - debitTotal + creditMainTotal
      this.total_balance = totalBalance

      let availableBalance = totalBalance - blockAmount
      this.available_balance = availableBalance

      // console.log("creditTotal",creditTotal)
      // console.log("debitTotal",debitTotal)
      // console.log("blockAmount",blockAmount)
      // console.log("totalBalance",totalBalance)
      // console.log("availableBalance",availableBalance)
      // console.log("creditMainTotal ",creditMainTotal)

      if (commit) {

        await this.save({ transaction })

      }

      console.log("wallet balance update completed for ", this.id)

      return this


    };





    /**
     *
     * @returns {Promise<Number>}
     */
    withdrawToAddress = async ({ amount, address, transaction = null, wallet }) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .withdrawToAddress({
          amount,
          address,
          transaction,
          wallet
        });
      // send funds to master
    };



    chargeWallet = async ({ amount = null, transaction = null }) => {
      if (!amount) throw new Error("amount is required")
      return await this.createTransaction({
        quantity: amount,
        type: TRANSACTION_TYPES.DEBIT,
        status: TRANSACTION_STATUS.ACTIVE,
        reason: TRANSACTION_REASON.FEES
      }, { transaction })
    }


    /**
     *
     * @returns {Promise<Number>}
     */
    withdrawToMaster = async ({ transaction = null }) => {
      // send funds to master
    };



    /**
     *
     * @param {Number|String} amount
     * @param {Boolean} [withAffiliate=true]
     * @returns {Promise<Number>}
     */
    getTotalCharges = async ({ amount, withAffiliate = true }) => {

      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getTotalCharges({
          amount,
          withAffiliate
        });
    };



    /**
     *
     * @returns {Promise<Any>}
     */
    getWalletKeys = async (args = {}) => {

      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getWalletKeys(args);
    };

    /**
     *
     * @returns {Promise<Number>}
     */
    getTransactionFee = async (args) => {

      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getTransactionFee(args);
    };

    /**
     * @typedef GetChargesWallet
     * @property {Number|String} amount
     * @property {Model} wallet
     *
     */

    /**
     * this function return a list of object containing amount and wallet
     * [{amount:0.03,wallet:Wallet},...]
     * @param {Number|String} amount
     * @param {Boolean} [withAffiliate=true]
     * @returns {Promise<GetChargesWallet[]>}
     */
    getWalletsForTransactionFee = async ({ amount, withAffiliate = true }) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getWalletsForTransactionFee({
          amount,
          withAffiliate
        });
    };

    /**
     *
     * @param {Number|String} amountToSend
     * @param {Boolean} [withAffiliate=true]
     * @returns {Promise<Boolean>}
     */
    hasSufficientAmount = async ({ amountToSend, withAffiliate = true }) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .hasSufficientAmount({
          amountToSend,
          withAffiliate
        });
    };

    /**
     *
     * @param {Number} quantity
     * @param {String} address
     * @returns {Promise}
     */
    transferToAddress = async ({ quantity, address }) => {
      // return walletServices.transferToAddress(this, address, quantity);
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .transferToAddress({
          quantity,
          address,
        });
    };

    /**
     *
     * @param {Object} params
     * @param {Wallet} params.wallet
     * @param {Number} params.quantity
     * @param {Boolean} params.testMode
     * @returns {Promise}
     */
    transferToWallet = async ({ wallet, quantity, testMode = false, noFee = false }) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .transferToWallet({
          wallet,
          quantity,
          testMode,
          noFee
        });
    };

    /**
     *
     * @param {Number} quantity
     * @returns {Promise<{id:string}|any>}
     */
    freezeWallet = async ({ quantity, fee }) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .freezeWallet({ quantity, fee });
    }

    unfreezeWallet = async ({ blockageId }) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .unfreezeWallet({ blockageId });
    }


    getBalance = async () => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getBalance();
    }


    checkAndTransferToMasterAddress = async (args = {}) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .checkAndTransferToMasterAddress(args);
    }


    getWalletBalance = async (args = {}) => {
      return await (new walletPlugin())
        .registerWallet(this)
        .registerSequelize(sequelize)
        .getWalletBalance(args);
    }

    /**
     * 
     * @param {import('../../schema/logger.metadata.schema').TRADESSchema} metadata 
     * @returns {Promise<import('../../schema/others').StatusResponse>}
     */
    async logTrade(metadata) {

      /**
       * @type Model
       */
      const Logger = sequelize.models.Logger
      await Logger.create({
        type: LOG_TYPES.TRADES,
        metadata
      })

      return { status: "success", message: "transaction log has been created" }
    }

    /**
     * 
     * @param {import('../../schema/logger.metadata.schema').TRANSACTIONSSchema} metadata 
     * @returns {Promise<import('../../schema/others').StatusResponse>}
     */
    async logTransaction(metadata) {

      /**
       * @type Model
       */
      const Logger = sequelize.models.Logger
      await Logger.create({
        type: LOG_TYPES.TRANSACTIONS,
        metadata
      })

      return { status: "success", message: "transaction log has been created" }
    }

    /**
     * 
     * @param {import('../../schema/logger.metadata.schema').COMMISSIONSchema} metadata 
     * @returns {Promise<import('../../schema/others').StatusResponse>}
     */
    async logCommission(metadata) {

      /**
       * @type Model
       */
      const Logger = sequelize.models.Logger
      await Logger.create({
        user_id: this.user_id,
        type: LOG_TYPES.COMMISSION,
        metadata
      })

      return { status: "success", message: "commission log has been created" }
    }

    async getUserAirdrop() {
      const Airdroptransaction = sequelize.models.Airdroptransaction;
      const airdrop = await Airdroptransaction.findAll({
        where: {
          user_id: this.dataValues?.user_id,
          crypto: this.dataValues?.currency
        },
        attributes: [
          "crypto", [sequelize.fn('sum', sequelize.col('amount')), 'total_payment'], [sequelize.fn('max', sequelize.col('created_at')), 'last_payment_date'],

        ],
        group: ["crypto"],

      });

      return airdrop;

    }

    toPublic() {
      return this.dataValues = _.omit(
        this.dataValues,
        "derivation_key",
        "signature_id",
        "UserId",
        "customerId",
        "accountCode",
        "mnemonic",
        "private_key",
        "derivation_key",
        "signature_id",
        "tatum_account_id",
        "user_id",
        "accountCode",
        "xpub",
        "is_company_wallet"
      );
    }
  }

  Wallet.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      signature_id: DataTypes.UUID,
      tatum_account_id: DataTypes.STRING,
      memo: DataTypes.STRING,
      mnemonic: DataTypes.STRING,
      destination_tag: DataTypes.STRING,
      derivation_key: DataTypes.INTEGER,
      address: DataTypes.STRING,
      network: DataTypes.STRING,
      frozen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_balance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      available_balance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      last_tatum_balance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      total_success_deposit: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      total_fee_pay: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      total_token_fee_pay: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      // create companies account
      is_company_wallet: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      next_check_deposit_date: {
        type: DataTypes.DATE,
        defaultValue: new Date()
      },
      last_trx: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Wallet",
      underscored: true,
      tableName: TABLE_NAMES?.WALLET || "tbl_wallets",
      hooks,
      paranoid: true,
      deletedAt: "archived_at",
    }
  );
  return Wallet;
};
