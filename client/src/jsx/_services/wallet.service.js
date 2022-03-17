import Services from "./Services";

/**
 * Class of all Group services
 * @class
 */
export default class WalletServices extends Services {
  constructor(init) {
    super(init);
    this._name = "WALLET";
    return this;
  }

  /************************* WALLET ******************************/
  /**
   * @function find - Gets wallets (**Admin only**)
   * @param {Object} params
   * @returns
   */
  find = async (params) => {  
    return await this.decorate(
      async () =>
        await this?.axios(`wallet`, {
          method: "GET",
          params,
        })
    );
  };

  /**
   * @function findByAddress - Gets a wallet balances (**Admins only**)
   * @param {string} [id] - Wallet ID
   * @param {Object} params - Response limit
   * @returns
   */
  findByAddress = async (address, params) => {
    return await this.decorate(
      async () =>
        await this?.axios(`wallet/${address}`, {
          method: "GET",
          params,
        })
    );
  };

  /**
   * @description Wallet Withdrawal service
   * @function withdraw
   * @param {Object} data
   * @param {Object} data.from
   * @param {Object} data.to
   * @param {String} data.amount
   * @returns
   */
  withdraw = async (data) => {
    return await this.decorate(
      async () =>
        await this?.axios(`wallet/withdraw`, {
          method: "POST",
          data,
        })
    );
  };
  /**
   * @description Wallet Withdrawal service
   * @function withdraw
   * @param {Object} data
   * @param {Object} data.from
   * @param {Object} data.to
   * @param {String} data.amount
   * @returns
   */
  approve = async (id,data) => {
    return await this.decorate(
      async () =>
        await this?.axios(`wallet/approve`, {
          method: "POST",
          data,
        })
    );
  };
  /**
   * @description Wallet Withdrawal service
   * @function withdraw
   * @param {Object} data
   * @param {Object} data.from
   * @param {Object} data.to
   * @param {String} data.amount
   * @returns
   */
  disapprove = async (id, data) => {
    return await this.decorate(
      async () =>
        await this?.axios(`wallet/disapprove/`, {
          method: "POST",
          data,
        })
    );
  };
}
