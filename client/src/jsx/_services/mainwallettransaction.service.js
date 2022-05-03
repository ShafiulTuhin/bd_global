import Services from "./Services";

class TransactionService extends Services {
  constructor(init) {
    super(init);
    this._name = "MANAGER_TRANSACTION";
    return this;
  }
  // FIND ------------------------------------------------------------------
  /**
   * @function find
   * @param {Object} params
   * @returns
   */
  find = async (params) => {
    return await this.decorate(
      async () =>
        await this.axios(`mainwallet/transation`, {
          method: "GET",
          params,
        })
    );
  };
}

export default TransactionService;
