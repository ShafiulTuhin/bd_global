const { Sequelize } = require("sequelize");
const Tatum = require("@tatumio/tatum");
const axios = require("axios").default;
const boom = require("@hapi/boom");
const $PATH = require("path");
const $KEYS_BACKUP_DIRNAME = ".cointc_keys"; //Keys directory name

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
 * @typedef {{id:String,user_id: String,signature_id: String,tatum_account_id: String,derivation_key: Number,address: String,frozen: Boolean,currency: String,is_company_wallet: Boolean}} WalletSchema
 */

/**
 * @typedef HDWalletKeys
 * @property {String} mnemonic
 * @property {String} xpub
 * @property {String} signatureId
 */

/**
 * @typedef XRPWalletKeys
 * @property {String} address
 * @property {String} secret
 * @property {String} signatureId
 */

class WalletInterface {
  constructor() {
    this.testnet = process.env.NODE_ENV == "development" ? true : false;
    this.Tatum = Tatum;
    this.axios = axios;
    /**
     * @type {WalletSchema}
     */
    this.wallet = null;
    this.sequelize = null;
  }

  async getTransactionFee({}) {
    return 0;
  }

  /**
   *
   * @param {WalletSchema} wallet
   * @returns {WalletInterface}
   */
  registerWallet(wallet) {
    this.wallet = wallet;
    return this;
  }

  /**
   * @returns {Promise<HDWalletKeys|XRPWalletKeys>}
   */
  async getWalletKeys(currency) {
    return keys[String((currency || this.wallet.currency)).toUpperCase()];
  }

  /**
   *
   * @param {Sequelize} sequelize
   * @returns {WalletInterface}
   */
  registerSequelize(sequelize) {
    this.sequelize = sequelize;
    return this;
  }

  /**
   *
   * @param {Object} args
   * @param {Number} args.amount
   * @param {Boolean} [args.withAffiliate=true]
   * @returns {Promise<Number>}
   */
  async getTotalCharges({ amount, withAffiliate = true }) {
    throw new Error("getTotalCharge(ref,amount) is not implemented");
  }
  /**
   *
   * @param {Object} args
   * @param {Number} args.amount
   * @param {Boolean} [args.withAffiliate=true]
   * @returns {Promise<GetChargesWallet>}
   */
  async getWalletsForTransactionFee({ amount, withAffiliate }) {
    throw new Error(
      "getWalletsForTransactionFee(ref,amount) is not implemented"
    );
  }

  /**
   *
   * @param {Object} args
   * @param {Number} args.amountToSend
   * @param {Boolean} [args.withAffiliate=true]
   * @returns {Promise<Boolean>}
   */
  async hasSufficientAmount({ amountToSend }) {
    throw new Error("hasSufficientAmount(ref,amountToSend) is not implemented");
  }

  /**
   *
   * @param {WalletSchema} wallet
   * @param {Number} quantity
   */
  async transferToWallet({ wallet, quantity }) {
    throw new Error("transferToWallet(ref,wallet,quantity) is not implemented");
  }

  /**
   *
   * @param {Number|String} quantity
   * @returns {Promise<{id:string}|any>}
   */
  async freezeWallet({ quantity }) {
    throw new Error("freezeWallet(ref,quantity) is not implemented");
  }

  /**
   *
   * @param {WalletSchema} ref
   * @param {String} blockageId
   */
  async unfreezeWallet({ blockageId }) {
    throw new Error("unfreezeWallet(ref,blockageId) is not implemented");
  }

  /**
   *
   */
  async getBalance() {
    let balance;

    try {
      if (this.wallet.dataValues) {
        balance = this.wallet.dataValues.balance;
      } else {
        balance = (await this.getTatumAccountById()).balance;
      }

      return balance;
    } catch (err) {
      console.debug(err);
    }
  }

  /**
   *
   */
  async createTatumAccount() {
    throw new Error(
      `createTatumAccount(${this.wallet.toString()}) is not implemented`
    );
  }

  /**
   *
   */
  // async getTatumAccountById(ref, sequelize) {
  //   throw new Error("getTatumAccountById(ref,sequelize) is not implemented");
  // }
  async getTatumAccountById() {
    let id = this.wallet.tatum_account_id;

    if (!id)
      throw new Error(`${this.wallet.currency} does not have tatum_account_id`);

    return await this.Tatum.getAccountById(id);
  }
  /**
   *
   * @returns {Promise<GetmanagedwalletResponse>}
   */
  async getmanagedwallet(ref, sequelize) {
    throw new Error("getmanagedwallet(ref,sequelize) is not implemented");
  }

  /**
   *
   */
  async removewallet() {
    throw new Error("removewallet(ref,sequelize) is not implemented");
  }

  /**
   *
   * @param {Number} index
   * @returns {Promise<{privateKey:string}>}
   */
  async getprivatekey({ index = 0 }) {
    throw new Error("getprivatekey(ref,index=0,sequelize) is not implemented");
  }

  /**
   *
   * @param {Number} index
   * @returns {Promise<{address:string}>}
   */
  async getaddress({ index = 0 }) {
    throw new Error("getaddress(ref,index=0,sequelize) is not implemented");
  }

  async exportAllKeys() {
    throw new Error("exportAllKeys() is not implemented");
  }

  /**
   *
   * @param {Number} index
   * @returns {Promise<{address:string}>}
   */
  async generateAddressFromXpub({ index = 0 }) {
    return this.Tatum.generateAddressFromXPub(
      this.wallet.currency,
      this.wallet.address,
      this.testnet,
      index
    );
  }

  /**
   *
   * @param {String} privateKey
   * @returns {Promise<{address:string}>}
   */
  async generateAddressFromPrivatekey({ privateKey }) {
    return this.Tatum.generateAddressFromPrivatekey(
      this.wallet.currency,
      this.testnet,
      privateKey
    );
  }

  /**
   *
   * @typedef Transaction
   * @property {String} recipientAccountId
   * @property {String} amount
   * @property {Boolean} [anonymous=false]
   * @property {Boolean} [compliant]
   * @property {String} [transactionCode]
   * @property {String} [paymentId]
   * @property {String} [recipientNote]
   * @property {Number} [baseRate]
   * @property {String} [senderNote]
   */

  /**
   *
   * @param {Object} payload
   * @param {Sting} payload.senderAccountId
   * @param {Sting} payload.address
   * @param {Sting} payload.amount
   * @param {Sting} [payload.attr]
   * @param {Boolean} [payload.compliant]
   * @param {String} payload.fee
   * @param {String} [payload.paymentId]
   * @param {String} [payload.senderNote]
   * @param {String[]} [payload.multipleAmounts]
   * @returns {Promise<{reference:string,id:string}>}
   */
  async withdrawApi(payload) {
    try {
      let url = "https://api-eu1.tatum.io/v3/offchain/withdrawal";
      const res = await this.axios.post(
        url,
        {
          senderAccountId: accountETH1.account.id,
          transaction: [
            {
              recipientAccountId: "61b5a5a9d4ce272417dd67c7",
              amount: "0.0002",
              anonymous: false,
            },
          ],
        },
        {
          headers: {
            "X-Api-Key": process.env.TATUM_API_KEY,
          },
        }
      );

      return res;
    } catch (error) {
      console.error(error);
      throw boom.boomify(error);
    }
  }

  /**
   *
   * @param {Object} payload
   * @param {Sting} payload.id
   * @param {Sting} payload.txId
   * @returns {Promise<{reference:string,id:string}>}
   */
  async completeWithdrawApi(payload) {
    try {
      let url = `https://api-eu1.tatum.io/v3/offchain/withdrawal/${id}/${txId}`;
      await this.axios.post(
        url,
        {},
        {
          headers: {
            "X-Api-Key": process.env.TATUM_API_KEY,
          },
        }
      );

      return { status: "success" };
    } catch (error) {
      console.error(error);
      throw boom.boomify(error);
    }
  }

  /**
   *
   * @param {Object} payload
   * @param {Sting} payload.senderAccountId
   * @param {Transaction[]} payload.transaction
   * @returns {Promise<{reference:string}>}
   */
  async sendApiTransaction(payload) {
    try {
      let url = "https://api-eu1.tatum.io/v3/ledger/transaction/batch";
      const res = await this.axios.post(url, payload, {
        headers: {
          "X-Api-Key": process.env.TATUM_API_KEY,
        },
      });

      return res;
    } catch (error) {
      console.error(error);
      throw boom.boomify(error);
    }
  }

  /**
   *
   */
  async checkAndTransferToMasterAddress() {
    throw new Error(
      `createTatumAccount(${this.wallet.toString()}) is not implemented`
    );
  }

  /**
   *
   */
   async getWalletBalance() {
    throw new Error(
      `createTatumAccount(${this.wallet.toString()}) is not implemented`
    );
  }

  /**
   *
   * @param {Number} quantity
   * @param {String} address
   */
  async transferToAddress({ quantity, address }) {
    const { reference } = await this.withdrawApi({
      address,
      amount: String(quantity),
      senderAccountId: this.wallet.tatum_account_id,
    });

    return { txId: reference };
  }
}

module.exports = WalletInterface;
