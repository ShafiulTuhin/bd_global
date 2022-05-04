const axios = require("axios").default;
const assert = require("assert");
const tatum = require("@tatumio/tatum");


/*
  mnemonic: 'organ merit dune hotel essence basic riot buzz dirt impact damage auto sing soap glow giraffe glare eye damage chunk orphan verify awake buyer',
  const xpub = 'tpubDE4LDjyTNBXcv25ZZo1E9kaAABuG5hmMZ24PnEqhkfMTgJrhPsU3UMRAwtNtJJdGK2vNmWPCjeommeZ76JckVdoY1Fwj8ASvxgt2pjas6s3'
  const privateKey = 'cUSHCyB2HH8vZJeF3iSbSr5ERRHGSNHTuMYJC6dB8ipVqbFYURLw'
  user_id = '086d48d9-24bf-4720-bf67-f41dd5d7553c'
 */




class OffChain {
  /**
   * 
   * @param {axios} axios 
   */
  constructor(axios) {
    this.axios = axios
    this.baseURL = "/offchain"
  }


  /**
   * 
   * @param {Object} args
   * @param {Object} args.id account id
   * @returns {Promise}
   */
  async createNewDepositAddress(args) {
    const { id } = args

    return this.axios.request({
      url: `${this.baseURL}/account/${id}/`,
      method: "POST",
    })
  }

  /**
   * 
   * @param {Object} args
   * @param {Object} args.id account id
   * @returns {Promise}
   */
  async getAllDepositAddressForAccount(args) {
    const { id } = args

    return this.axios.request({
      url: `${this.baseURL}/account/${id}/address`,
      method: "GET",
    })
  }

  /**
   * 
   * @param {Object} args
   * @param {Object} args.id account id
   * @param {Object} args.address address
   * @returns {Promise}
   */
  async removeAddressFromAccount(args) {
    const { id, address } = args

    return this.axios.request({
      url: `${this.baseURL}/account/${id}/address/${address}/`,
      method: "DELETE",
    })
  }


  /**
   * 
   * @param {Object} args
   * @param {Object} args.id account id
   * @param {Object} args.address address
   * @returns {Promise}
   */
  async assignAddressForAccount(args) {
    const { id, address } = args

    return this.axios.request({
      url: `${this.baseURL}/account/${id}/address/${address}/`,
      method: "POST",
    })
  }



  /**
   * 
   * @param {Object} args
   * @param {tatum.TransferBtcBasedOffchainKMS} args.data
   * @returns {Promise<tatum.SignatureId>}
   */
  async sendBitcoinFromAccount(args) {
    const { data } = args

    return this.axios.request({
      url: `${this.baseURL}/bitcoin/transfer/`,
      method: "POST",
      data
    })
  }


  /**
   * supported chain
   * BTC,
   * ETH,
   * USDT,
   * XRP
   * EOS
   * 
   * @param {Object} param
   * @param {tatum.Currency} param.currency
   * @param {Object} param.data
   */
  async blockchainTransfer({ currency, data }) {

    /**
     
     */
    let types = {
      [tatum.Currency.BTC]: 'bitcoin',
      [tatum.Currency.ETH]: 'ethereum',
      // [tatum.Currency.USDT]:'ethereum',
      [tatum.Currency.XRP]: 'xrp',
      // [tatum.Currency.EOS]:'xrp',
    }
    let type = types[currency]
    if (!type) throw new Error(currency + " is not a support currency for tatum api")



    return this.axios.request({
      url: `${this.baseURL}/${type}/transfer/`,
      method: "POST",
      data
    })

  }
}

class Ledger {
  /**
   *
   * @param {axios} axios
   */
  constructor(axios) {
    this.baseURL = "/ledger";

    this.axios = axios;
  }

  /**
   *
   * @param {Object} args
   * @param {String} args.id
   * @returns {Promise}
   */
  getAccountById(args) {
    const { id } = args;
    return this.axios.request({
      url: `${this.baseURL}/account/${id}/`,
    });
  }

  /**
   *
   * @param {Object} args
   * @param {String} args.id
   * @returns {Promise}
   */
  getAccountBalance(args) {
    const { id } = args;
    return this.axios.request({
      url: `${this.baseURL}/account/${id}/balance`,
    });
  }

  /**
   *
   * @param {Object} args
   * @param {String} args.id
   * @returns {Promise}
   */
  freezeAccount(args) {
    const { id } = args;
    return this.axios.request({
      url: `${this.baseURL}/account/${id}/freeze`,
      method: "PUT",
    });
  }

  /**
   *
   * @param {Object} args
   * @param {String} args.id
   * @returns {Promise}
   */
  unfreezeAccount(args) {
    const { id } = args;
    return this.axios.request({
      url: `${this.baseURL}/account/${id}/unfreeze`,
      method: "PUT",
    });
  }

  /**
   *
   * @param {Object} args
   * @param {tatum.Account} args.data
   * @returns {Promise}
   */
  createAccount(args) {
    const { data } = args;
    return this.axios.request({
      url: `${this.baseURL}/account/`,
      method: "POST",
      data,
    });
  }

  /**
   *
   * @param {Object} args
   * @param {Object} args.params
   * @param {Number} args.params.pageSize
   * @param {Number} args.params.offset
   * @param {String} args.params.accountCode
   * @returns {Promise}
   */
  listAllAccounts(args) {
    const { params = {} } = args;

    return this.axios.request({
      url: `${this.baseURL}/account/`,
      method: "GET",
      params,
    });
  }

  /**
   *
   * @param {Object} args
   * @param {Object} args.data
   * @param {tatum.Account[]} args.data.accounts
   * @returns {Promise}
   */
  createMultipleAccounts(args) {
    const { data } = args;

    return this.axios.request({
      url: `${this.baseURL}/account/`,
      method: "GET",
      data,
    });
  }
}




/**
 * this client is ment to intract with the api while the wallet service is use to
 * to create methods to interface between the api client and Gines Global
 */

class TatumAPI {
  constructor() {
    // check if api key is available
    assert(process.env.TATUM_API_KEY, "TATUM_API_KEY was not provided");

    this.axios = axios.create({
      baseURL: "https://api-eu1.tatum.io/v3",
      timeout: 1000,
      headers: {
        "x-api-key": process.env.TATUM_API_KEY,
        "Content-Type": "application/json",
      },
    });

    this.Ledger = new Ledger(this.axios);
    this.OffChain = new OffChain(this.axios);
  }
}

module.exports = new TatumAPI();
