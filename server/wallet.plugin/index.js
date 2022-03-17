const WalletInterface = require("./wallet.interface");
const tatum = require("@tatumio/tatum");
const { Sequelize, Op } = require("sequelize");
const cmd = require("../services/commandline.utils");
const $PATH = require("path");
const $KEYS_BACKUP_DIRNAME = ".cointc_keys";
const {
  FEE_TYPES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  TRANSACTION_REASON,
} = require("../constants");
const { v4: uuidv4 } = require("uuid");

const $KEYS_DIR = $PATH.join(
  process.env.KEYS_DIR ||
  $PATH.join(
    process.env.BACKUP_DIR ||
    $PATH.join(__dirname, "..", "..", "..", ".cointc_backup"),
    $KEYS_BACKUP_DIRNAME
  ),
  "keys.json"
);

let keys;
try {
  keys = require($KEYS_DIR);
} catch (err) {
  keys = {};
}

/**
 * @typedef GetmanagedwalletResponse
 * @property {String} mnemonic
 * @property {String} xpriv
 * @property {String} xpub
 * @property {String} testnet
 * @property {String} chain
 */

class WalletPlugin extends WalletInterface {
  /**
   *
   * @param {"BTC"|"ETH"|"BNB"|"XRP"|"USDT"} currency
   * @returns {WalletInterface}
   */
  #getWalletPlugin() {
    if (!this.wallet)
      throw new Error("you must register wallet into walletPlugin");

    try {
      let plugin = `./plugins/${String(this.wallet.currency).toUpperCase()}`;
      let SingleWalletPlugin = require(plugin);
      return new SingleWalletPlugin()
        .registerWallet(this.wallet)
        .registerSequelize(this.sequelize || this.wallet.sequelize);
    } catch (error) {
      console.error(error)
      throw new Error(`${this.wallet.currency} plugin does not exist`);
    }
  }

  async getWalletPluginForAdmin(payload) {
    // console.log("index getWalletPluginForAdmin   ",payload);
    // if (!this.wallet)
    //   throw new Error("you must register wallet into walletPlugin");

    try {
      let plugin = await `./plugins/${String(payload?.currency).toUpperCase()}`;
      let SingleWalletPlugin = require(plugin);
      // console.log(keys[`${String(currency).toUpperCase()}`])
      let currenctKey = await keys[`${String(payload?.currency).toUpperCase()}`]
      return await (new SingleWalletPlugin())
        .MasterToManagerAddress(currenctKey, payload);

    } catch (error) {
      console.error(error)
      throw new Error(`${payload.currency} plugin does not exist`);
    }
  }
  /**
   *
   * @param {Object} args
   * @param {Number} args.amount
   * @param {Boolean} [args.withAffiliate=true]
   * @returns {Promise<Number>}
   */
  async getTotalCharges({ amount, withAffiliate = true }) {
    // return await this.#getWalletPlugin(this.wallet.currency).getTotalCharges(ref,amount,sequelize)

    if (!amount) throw new Error("amount must be provided");

    // retrieve Fee and Affiliate models
    const { Fee } = this.sequelize.models;

    /**
     * @type {Model|null}
     */
    let affiliate;

    if (withAffiliate) {
      // find referrer if it exist
      let user = await this.wallet.getUser();
      affiliate = user.referrer_id;
    }

    /**
     * @type {Array}
     */
    const fees = await Fee?.findAll({
      where: {
        type: {
          [Op.in]: [
            FEE_TYPES.TRANSACTION,
            ...(affiliate ? [FEE_TYPES.COMMISSION] : []),
          ],
        },
      },
    });

    const total = fees.reduce((previous, current) => {
      return previous + Number(current.amount_in_percent);
    }, 0);

    return (total / 100) * Number(amount);
  }

  /**
   * @typedef GetChargesWallet
   * @property {Number|String} amount
   * @property {import('./wallet.interface').WalletSchema} wallet
   *
   */

  /**
   *
   * @param {Object} args
   * @param {Number} args.amount
   * @param {Boolean} [args.withAffiliate=true]
   * @returns {Promise<GetChargesWallet>}
   */
  async getWalletsForTransactionFee({ amount, withAffiliate = true }) {
    let result = {};
    let { masterAddress } = await this.getWalletKeys();
    // return await this.#getWalletPlugin(this.wallet.currency).getWalletsForTransactionFee(ref,amount,sequelize)
    if (!amount) throw new Error("amount must be provided");
    // retrieve Fee, Affiliate and Wallet models
    const { Fee, Wallet } = this.sequelize.models;

    let reffererWallet, affiliate;

    if (withAffiliate) {
      // check if this wallet user was reffered
      let user = await this.wallet.getUser();
      /**
       * @type {Model|null}
       */
      affiliate = user.referrer_id;
    }

    // if wallet user was reffered get reffer wallet
    if (affiliate) {
      reffererWallet = await Wallet.findOne({
        where: {
          currency: this.wallet.currency,
          user_id: affiliate,
        },
      });
    }

    // get charges fee for both commission and commission where commission is optional
    // depending on if affiliate exist

    /**
     * @type {Array}
     */
    const fees = await Fee.findAll({
      where: {
        type: {
          [Op.in]: [
            FEE_TYPES.TRANSACTION,
            FEE_TYPES.WITHDRAWAL,
            ...(affiliate ? [FEE_TYPES.COMMISSION] : []),
          ],
        },
      },
    });


    // generate a list of object containing amount and the and the fee to be transfered to the wallet
    fees.forEach((fee) => {
      if (fee.type == FEE_TYPES.TRANSACTION && masterAddress) {
        result[FEE_TYPES.TRANSACTION] = {
          fee: (Number(fee.amount_in_percent) / 100) * Number(amount),
          wallet: {
            address: masterAddress,
          },
        };
      } else if (fee.type == FEE_TYPES.COMMISSION && reffererWallet) {  
        result[FEE_TYPES.COMMISSION] = {
          fee: (Number(fee.amount_in_percent) / 100) * Number(amount),
          wallet: reffererWallet,
        };
      } else if (fee.type == FEE_TYPES.WITHDRAWAL && masterAddress) {  
        result[FEE_TYPES.WITHDRAWAL] = {
          fee: parseFloat(fee.amount_in_percent),
          wallet: masterAddress,
        };
      }
      
    });
    return result;
  }
  /**
   *
   * @param {Object} args
   * @param {Number} args.amountToSend
   * @param {Boolean} [args.withAffiliate=true]
   * @returns {Promise<Boolean>}
   */
  async hasSufficientAmount({ amountToSend, withAffiliate = true }) {
    // // return this.#getWalletPlugin(this.wallet.currency).hasSufficientAmount(ref,amountToSend)

    // const charges = await this.getTotalCharges({
    //   amount:amountToSend,
    //   withAffiliate
    // });
    const { Fee } = this.sequelize.models;
    const fees = await Fee.findOne({
      where: {
        type: FEE_TYPES.WITHDRAWAL,
      },
    });

    let fee_amount = fees && fees.amount_in_percent ? fees.amount_in_percent : 0;

    return this.wallet.available_balance > Number(amountToSend) + Number(fee_amount);
  }

  /**
   *
   * @param {Object} args
   * @param {Number} args.quantity
   * @param {String} args.address
   */
  async transferToAddress({ quantity, address }) {
    return await this.#getWalletPlugin().transferToAddress({
      quantity,
      address,
    });
  }

  /**
   *
   */
  async getTransactionFee(args) {
    return await this.#getWalletPlugin().getTransactionFee(args);
  }
  /**
   *
   */
  async withdrawToAddress(param = {}) {
    return await this.#getWalletPlugin().withdrawToAddress(param);
  }

  /**
   *
   * @param {Object} args
   * @param {import('./wallet.interface').WalletSchema} args.wallet
   * @param {Number} args.quantity
   */
  async transferToWallet({
    wallet,
    quantity: amount,
    testMode = false,
    noFee,
  }) {
    // return await this.#getWalletPlugin().transferToWallet({
    //   wallet,
    //   quantity,
    //   testMode,
    //   noFee
    // });

    /**
     * @typedef GetChargesWallet
     * @property {Number} fee
     * @property {import('../wallet.interface').WalletSchema} wallet
     *
     */

    let chargeWallets, from;

    /**
     * @type {GetChargesWallet}
     */
    chargeWallets = {};

    // from = this



    if (!testMode) {
    
      /**
       * @type {GetChargesWallet[]}
       */
      chargeWallets =
        (await wallet.getWalletsForTransactionFee({ amount })) || {};
    }

    let ref = uuidv4();

    await this.sequelize.transaction(async (t) => {
      let res1, res2, res3, res4, res5;

      // transfer for p2p
      res2 = await this.wallet.createTransaction(
        {
          reference: ref,
          quantity: parseFloat(amount),
          type: TRANSACTION_TYPES.DEBIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.P2P,
        },
        { transaction: t }
      );
      res2 = await wallet.createTransaction(
        {
          reference: ref,
          quantity: amount,
          type: TRANSACTION_TYPES.CREDIT,
          status: TRANSACTION_STATUS.ACTIVE,
          reason: TRANSACTION_REASON.P2P,
        },
        { transaction: t }
      );
      if (chargeWallets?.TRANSACTION) {
        res3 = await wallet.createTransaction(
          {
            reference: ref,
            quantity: Number(chargeWallets.TRANSACTION.fee),
            type: TRANSACTION_TYPES.DEBIT,
            status: TRANSACTION_STATUS.ACTIVE,
            reason: TRANSACTION_REASON.FEES,
          },
          { transaction: t }
        );
      }

      if (chargeWallets.COMMISSION) {
        res4 = await this.wallet.createTransaction(
          {
            reference: ref,
            quantity: Number(chargeWallets.COMMISSION.fee),
            type: TRANSACTION_TYPES.DEBIT,
            status: TRANSACTION_STATUS.ACTIVE,
            reason: TRANSACTION_REASON.COMMISSION,
          },
          { transaction: t }
        );
        res5 = chargeWallets?.COMMISSION?.wallet?.createTransaction(
          {
            reference: ref,
            quantity: Number(chargeWallets.COMMISSION.fee),
            type: TRANSACTION_TYPES.CREDIT,
            status: TRANSACTION_STATUS.ACTIVE,
            reason: TRANSACTION_REASON.COMMISSION,
          },
          { transaction: t }
        );
      }

      return [res1, res2, res3, res4, res5];
    });
  }

  /**
   *
   * @param {String|Number} quantity
   * @returns {Promise<{id:string}|any>}
   */
  async freezeWallet({ quantity }) {
    if (!quantity) {
      throw new Error("no quantity was provided when freezing amount");
    }

    let blockage = await this.wallet.createBlockage({
      quantity: Number(quantity),
      active: true,
    });
    await this.wallet.updateBalance();

    return blockage;
  }

  /**
   *
   * @param {Object} args
   * @param {String} args.blockageId
   */
  async unfreezeWallet({ blockageId }) {
    let { Blockage } = this.sequelize.models;

    if (!blockageId)
      throw new Error(
        "blockageId not provided when unfreezing amount in wallet"
      );

    let blockage = await Blockage.findOne({
      where: {
        id: blockageId,
        wallet_id: this.wallet.id,
      },
    });

    if (!blockage) {
      console.log("blockage does not exist");
    }
    if (blockage.active) {
      blockage.active = false;
      await blockage.save();
      await this.wallet.updateBalance();
    }

    return blockage;
  }

  /**
   *
   * @returns {Promise<tatum.AccountBalance>}
   */
  async getBalance() {
    // return this.#getWalletPlugin().getBalance()

    return {
      availableBalance: this.wallet.available_balance,
      totalBalance: this.wallet.total_balance,
    };
  }

  /**
   *
   */
  async checkAndTransferToMasterAddress(args) {
    return await this.#getWalletPlugin().checkAndTransferToMasterAddress(args);
  }

  /**
   *
   */
  async withdrawToAddress(args) {
    return await this.#getWalletPlugin().withdrawToAddress(args);
  }

  /**
   *
   */
  async createTatumAccount() {
    try {
      return await this.#getWalletPlugin().createTatumAccount();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *
   */
  async getTatumAccountById() {
    return await this.#getWalletPlugin().getTatumAccountById();
  }

  /**
   *
   * @returns {Promise<GetmanagedwalletResponse>}
   */
  async getmanagedwallet() {
    return await cmd(`tatum-kms getmanagedwallet ${this.wallet.signature_id}`);
  }

  /**
   *
   */
  async removewallet() {
    await cmd(`tatum-kms removewallet ${this.wallet.signature_id}`);
  }

  /**
   *
   * @param {Number} index
   * @returns {Promise<{privateKey:string}>}
   */
  async getprivatekey({ index = 0 }) {
    return await cmd(
      `tatum-kms getprivatekey ${this.wallet.signature_id} ${index}`
    );
  }

  /**
   *
   * @param {Number} index
   * @returns {Promise<{address:string}>}
   */
  async getaddress({ index = 0 }) {
    return await cmd(
      `tatum-kms getaddress ${this.wallet.signature_id} ${index}`
    );
  }

  async exportAllKeys() {
    return await cmd("tatum-kms export");
  }

  async getBalanceByDepositTag() { }
}

module.exports = WalletPlugin;
